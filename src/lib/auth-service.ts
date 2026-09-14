import { prisma, isDatabaseReachable } from "./db";
import { hashPassword, verifyPassword, generateRandomToken, hashToken } from "./crypto";
import {
  ROLES,
  ROLE_PERMISSIONS_MATRIX,
  AUTH_CONFIG,
  RoleSlugType,
} from "./auth-constants";
import {
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "./errors";
import { RegisterInput, LoginInput } from "./validation";

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  customerTier: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  role: {
    id: string;
    name: string;
    slug: string;
  };
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
  wallet: {
    id: string;
    currentBalance: string;
    ledgerBalance: string;
    status: string;
  } | null;
  permissions: string[];
}

export interface AuthSessionData {
  sessionToken: string;
  user: AuthenticatedUserPayload;
  expiresAt: Date;
}

// ---------------------------------------------------------------------------
// Resilient In-Memory State Store (Active when MySQL daemon is unreachable)
// ---------------------------------------------------------------------------
interface StoredUser {
  id: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  status: string;
  customerTier: string;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  roleId: string;
  roleSlug: string;
  roleName: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

interface StoredWallet {
  id: string;
  userId: string;
  currentBalance: string;
  ledgerBalance: string;
  status: string;
}

interface StoredSession {
  id: string;
  userId: string;
  tokenHash: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

interface StoredToken {
  id: string;
  userId: string;
  tokenHash: string;
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "PHONE_VERIFICATION";
  expiresAt: Date;
  isUsed: boolean;
  usedAt: Date | null;
  createdAt: Date;
}

class InMemoryAuthStore {
  private users: Map<string, StoredUser> = new Map();
  private wallets: Map<string, StoredWallet> = new Map();
  private sessions: Map<string, StoredSession> = new Map();
  private tokens: Map<string, StoredToken> = new Map();
  private initialized = false;

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    // Seed baseline accounts for interactive testing
    const defaultPasswordHash = hashPassword("Admin@123456");

    const seedUsers: Array<StoredUser & { balance: string }> = [
      {
        id: "usr-super-admin-01",
        email: "superadmin@hambaktech.com.ng",
        phone: "+2348000000001",
        passwordHash: defaultPasswordHash,
        status: "ACTIVE",
        customerTier: "CORPORATE",
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        roleId: "role-super-admin",
        roleSlug: ROLES.SUPER_ADMIN,
        roleName: "Super Administrator",
        firstName: "System",
        lastName: "Owner",
        createdAt: new Date(),
        balance: "500000.00",
      },
      {
        id: "usr-admin-01",
        email: "admin@hambaktech.com.ng",
        phone: "+2348000000002",
        passwordHash: defaultPasswordHash,
        status: "ACTIVE",
        customerTier: "CORPORATE",
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        roleId: "role-admin",
        roleSlug: ROLES.ADMIN,
        roleName: "Administrator",
        firstName: "Operations",
        lastName: "Admin",
        createdAt: new Date(),
        balance: "250000.00",
      },
      {
        id: "usr-staff-01",
        email: "staff@hambaktech.com.ng",
        phone: "+2348000000003",
        passwordHash: defaultPasswordHash,
        status: "ACTIVE",
        customerTier: "STANDARD",
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        roleId: "role-staff",
        roleSlug: ROLES.STAFF,
        roleName: "Operational Staff",
        firstName: "Service",
        lastName: "Desk",
        createdAt: new Date(),
        balance: "50000.00",
      },
      {
        id: "usr-customer-01",
        email: "customer@hambaktech.com.ng",
        phone: "+2348147837664",
        passwordHash: defaultPasswordHash,
        status: "ACTIVE",
        customerTier: "STANDARD",
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        roleId: "role-customer",
        roleSlug: ROLES.CUSTOMER,
        roleName: "Platform Customer",
        firstName: "Abubakar",
        lastName: "Ibrahim",
        createdAt: new Date(),
        balance: "15500.00",
      },
      {
        id: "usr-student-01",
        email: "student@hambaktech.com.ng",
        phone: "+2349019120241",
        passwordHash: defaultPasswordHash,
        status: "ACTIVE",
        customerTier: "STANDARD",
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        roleId: "role-student",
        roleSlug: ROLES.STUDENT,
        roleName: "Academy Student",
        firstName: "Maryam",
        lastName: "Bello",
        createdAt: new Date(),
        balance: "3000.00",
      },
    ];

    for (const u of seedUsers) {
      this.users.set(u.id, u);
      this.wallets.set(u.id, {
        id: `wal-${u.id}`,
        userId: u.id,
        currentBalance: u.balance,
        ledgerBalance: u.balance,
        status: "ACTIVE",
      });
    }
  }

  public findUserByEmailOrPhone(credential: string): StoredUser | null {
    this.init();
    const clean = credential.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === clean || (user.phone && user.phone.trim() === clean)) {
        return user;
      }
    }
    return null;
  }

  public findUserById(id: string): StoredUser | null {
    this.init();
    return this.users.get(id) ?? null;
  }

  public createUser(user: StoredUser, initialBalance = "0.00"): StoredUser {
    this.init();
    this.users.set(user.id, user);
    this.wallets.set(user.id, {
      id: `wal-${user.id}`,
      userId: user.id,
      currentBalance: initialBalance,
      ledgerBalance: initialBalance,
      status: "ACTIVE",
    });
    return user;
  }

  public updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
    this.init();
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  public getWallet(userId: string): StoredWallet | null {
    this.init();
    return this.wallets.get(userId) ?? null;
  }

  public saveSession(session: StoredSession): void {
    this.init();
    this.sessions.set(session.tokenHash, session);
  }

  public getSession(tokenHash: string): StoredSession | null {
    this.init();
    const s = this.sessions.get(tokenHash);
    if (!s) return null;
    if (s.isRevoked || s.expiresAt < new Date()) {
      return null;
    }
    return s;
  }

  public revokeSession(tokenHash: string): void {
    this.init();
    const s = this.sessions.get(tokenHash);
    if (s) {
      s.isRevoked = true;
    }
  }

  public revokeAllUserSessions(userId: string): void {
    this.init();
    for (const s of this.sessions.values()) {
      if (s.userId === userId) {
        s.isRevoked = true;
      }
    }
  }

  public saveToken(token: StoredToken): void {
    this.init();
    this.tokens.set(token.tokenHash, token);
  }

  public getToken(tokenHash: string): StoredToken | null {
    this.init();
    const t = this.tokens.get(tokenHash);
    if (!t) return null;
    return t;
  }

  public markTokenUsed(tokenHash: string): void {
    this.init();
    const t = this.tokens.get(tokenHash);
    if (t) {
      t.isUsed = true;
      t.usedAt = new Date();
    }
  }
}

const memoryStore = new InMemoryAuthStore();

/**
 * Checks if the underlying database is reachable.
 */
async function isDatabaseOnline(): Promise<boolean> {
  const reachable = await isDatabaseReachable();
  if (!reachable) return false;

  try {
    // Perform light query test only if TCP socket is open
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

function getPermissionsForRole(roleSlug: string): string[] {
  const matrix = ROLE_PERMISSIONS_MATRIX[roleSlug as RoleSlugType];
  if (matrix) return matrix;
  return ROLE_PERMISSIONS_MATRIX[ROLES.CUSTOMER];
}

// ---------------------------------------------------------------------------
// Authoritative Authentication Service Methods
// ---------------------------------------------------------------------------

/**
 * Register a new customer/user account.
 * Follows: Validation -> Password hashing -> User record -> Profile -> Wallet -> Verification Token
 */
export async function register(
  input: RegisterInput,
  options?: { ipAddress?: string; userAgent?: string }
): Promise<{
  sessionData: AuthSessionData;
  verificationToken: string;
}> {
  const dbOnline = await isDatabaseOnline();
  const rawSessionToken = generateRandomToken(32);
  const sessionHash = hashToken(rawSessionToken);

  const rawVerificationToken = generateRandomToken(32);
  const verificationHash = hashToken(rawVerificationToken);

  const hashedPassword = hashPassword(input.password);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + AUTH_CONFIG.SESSION_EXPIRATION_DAYS);

  const verificationExpiresAt = new Date();
  verificationExpiresAt.setHours(
    verificationExpiresAt.getHours() + AUTH_CONFIG.EMAIL_VERIFICATION_EXPIRATION_HOURS
  );

  const roleSlug = input.roleSlug ?? ROLES.CUSTOMER;

  if (dbOnline) {
    // 1. Check existing email or phone
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { phone: input.phone }],
      },
    });

    if (existing) {
      if (existing.email === input.email) {
        throw new ConflictError("An account with this email address already exists.");
      }
      throw new ConflictError("An account with this phone number already exists.");
    }

    // 2. Fetch Role
    const roleRecord = await prisma.role.findFirst({
      where: { slug: roleSlug },
    });

    if (!roleRecord) {
      throw new NotFoundError(`System role '${roleSlug}' could not be located.`);
    }

    // 3. Create User, Profile, Wallet, Session, and Verification Token in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          phone: input.phone,
          passwordHash: hashedPassword,
          status: "PENDING_VERIFICATION",
          customerTier: input.customerTier,
          roleId: roleRecord.id,
          profile: {
            create: {
              firstName: input.firstName,
              lastName: input.lastName,
            },
          },
          wallet: {
            create: {
              currentBalance: "0.00",
              ledgerBalance: "0.00",
              status: "ACTIVE",
            },
          },
          sessions: {
            create: {
              tokenHash: sessionHash,
              ipAddress: options?.ipAddress,
              userAgent: options?.userAgent,
              expiresAt,
            },
          },
          verificationTokens: {
            create: {
              tokenHash: verificationHash,
              type: "EMAIL_VERIFICATION",
              expiresAt: verificationExpiresAt,
            },
          },
        },
        include: {
          role: true,
          profile: true,
          wallet: true,
        },
      });

      return user;
    });

    const permissions = getPermissionsForRole(newUser.role.slug);

    const userPayload: AuthenticatedUserPayload = {
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      status: newUser.status,
      customerTier: newUser.customerTier,
      emailVerified: !!newUser.emailVerifiedAt,
      phoneVerified: !!newUser.phoneVerifiedAt,
      role: {
        id: newUser.role.id,
        name: newUser.role.name,
        slug: newUser.role.slug,
      },
      profile: newUser.profile
        ? {
            firstName: newUser.profile.firstName,
            lastName: newUser.profile.lastName,
            avatarUrl: newUser.profile.avatarUrl,
          }
        : null,
      wallet: newUser.wallet
        ? {
            id: newUser.wallet.id,
            currentBalance: newUser.wallet.currentBalance.toString(),
            ledgerBalance: newUser.wallet.ledgerBalance.toString(),
            status: newUser.wallet.status,
          }
        : null,
      permissions,
    };

    return {
      sessionData: {
        sessionToken: rawSessionToken,
        user: userPayload,
        expiresAt,
      },
      verificationToken: rawVerificationToken,
    };
  }

  // Fallback: In-Memory Resilient Store
  const existingInMemory = memoryStore.findUserByEmailOrPhone(input.email);
  if (existingInMemory) {
    throw new ConflictError("An account with this email address already exists.");
  }
  const existingPhone = memoryStore.findUserByEmailOrPhone(input.phone);
  if (existingPhone) {
    throw new ConflictError("An account with this phone number already exists.");
  }

  const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const storedUser: StoredUser = {
    id: userId,
    email: input.email,
    phone: input.phone,
    passwordHash: hashedPassword,
    status: "PENDING_VERIFICATION",
    customerTier: input.customerTier,
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    roleId: `role-${roleSlug}`,
    roleSlug,
    roleName: roleSlug.charAt(0).toUpperCase() + roleSlug.slice(1),
    firstName: input.firstName,
    lastName: input.lastName,
    createdAt: new Date(),
  };

  memoryStore.createUser(storedUser, "0.00");

  memoryStore.saveSession({
    id: `sess-${Date.now()}`,
    userId,
    tokenHash: sessionHash,
    ipAddress: options?.ipAddress ?? null,
    userAgent: options?.userAgent ?? null,
    expiresAt,
    isRevoked: false,
    createdAt: new Date(),
  });

  memoryStore.saveToken({
    id: `tok-${Date.now()}`,
    userId,
    tokenHash: verificationHash,
    type: "EMAIL_VERIFICATION",
    expiresAt: verificationExpiresAt,
    isUsed: false,
    usedAt: null,
    createdAt: new Date(),
  });

  const permissions = getPermissionsForRole(roleSlug);
  const userPayload: AuthenticatedUserPayload = {
    id: userId,
    email: storedUser.email,
    phone: storedUser.phone,
    status: storedUser.status,
    customerTier: storedUser.customerTier,
    emailVerified: false,
    phoneVerified: false,
    role: {
      id: storedUser.roleId,
      name: storedUser.roleName,
      slug: storedUser.roleSlug,
    },
    profile: {
      firstName: storedUser.firstName,
      lastName: storedUser.lastName,
      avatarUrl: null,
    },
    wallet: {
      id: `wal-${userId}`,
      currentBalance: "0.00",
      ledgerBalance: "0.00",
      status: "ACTIVE",
    },
    permissions,
  };

  return {
    sessionData: {
      sessionToken: rawSessionToken,
      user: userPayload,
      expiresAt,
    },
    verificationToken: rawVerificationToken,
  };
}

/**
 * Login user using Email/Phone and Password.
 * Generates an authenticated session and sets credentials.
 */
export async function login(
  input: LoginInput,
  options?: { ipAddress?: string; userAgent?: string }
): Promise<AuthSessionData> {
  const dbOnline = await isDatabaseOnline();
  const rawSessionToken = generateRandomToken(32);
  const sessionHash = hashToken(rawSessionToken);

  const expirationDays = input.rememberMe
    ? AUTH_CONFIG.REMEMBER_ME_EXPIRATION_DAYS
    : AUTH_CONFIG.SESSION_EXPIRATION_DAYS;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  if (dbOnline) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.credential }, { phone: input.credential }],
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        profile: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email/phone or password.");
    }

    if (user.status === "SUSPENDED") {
      throw new ForbiddenError("Your account has been suspended. Please contact HambakTech support.");
    }

    const isValidPassword = verifyPassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email/phone or password.");
    }

    // Persist session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        tokenHash: sessionHash,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        expiresAt,
      },
    });

    // Derive permissions
    let permissions: string[] = [];
    if (user.role.slug === ROLES.SUPER_ADMIN) {
      permissions = ["*"];
    } else {
      const explicit = user.role.rolePermissions.map((rp) => rp.permission.slug);
      permissions = explicit.length > 0 ? explicit : getPermissionsForRole(user.role.slug);
    }

    const userPayload: AuthenticatedUserPayload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      status: user.status,
      customerTier: user.customerTier,
      emailVerified: !!user.emailVerifiedAt,
      phoneVerified: !!user.phoneVerifiedAt,
      role: {
        id: user.role.id,
        name: user.role.name,
        slug: user.role.slug,
      },
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            avatarUrl: user.profile.avatarUrl,
          }
        : null,
      wallet: user.wallet
        ? {
            id: user.wallet.id,
            currentBalance: user.wallet.currentBalance.toString(),
            ledgerBalance: user.wallet.ledgerBalance.toString(),
            status: user.wallet.status,
          }
        : null,
      permissions,
    };

    return {
      sessionToken: rawSessionToken,
      user: userPayload,
      expiresAt,
    };
  }

  // Fallback: In-Memory Store
  const user = memoryStore.findUserByEmailOrPhone(input.credential);
  if (!user) {
    throw new UnauthorizedError("Invalid email/phone or password.");
  }

  if (user.status === "SUSPENDED") {
    throw new ForbiddenError("Your account has been suspended. Please contact HambakTech support.");
  }

  const isValidPassword = verifyPassword(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError("Invalid email/phone or password.");
  }

  memoryStore.saveSession({
    id: `sess-${Date.now()}`,
    userId: user.id,
    tokenHash: sessionHash,
    ipAddress: options?.ipAddress ?? null,
    userAgent: options?.userAgent ?? null,
    expiresAt,
    isRevoked: false,
    createdAt: new Date(),
  });

  const wallet = memoryStore.getWallet(user.id);
  const permissions = getPermissionsForRole(user.roleSlug);

  const userPayload: AuthenticatedUserPayload = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    status: user.status,
    customerTier: user.customerTier,
    emailVerified: !!user.emailVerifiedAt,
    phoneVerified: !!user.phoneVerifiedAt,
    role: {
      id: user.roleId,
      name: user.roleName,
      slug: user.roleSlug,
    },
    profile: {
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: null,
    },
    wallet: wallet
      ? {
          id: wallet.id,
          currentBalance: wallet.currentBalance,
          ledgerBalance: wallet.ledgerBalance,
          status: wallet.status,
        }
      : null,
    permissions,
  };

  return {
    sessionToken: rawSessionToken,
    user: userPayload,
    expiresAt,
  };
}

/**
 * Validates a raw session token and returns full user payload + permissions.
 */
export async function validateSession(rawToken: string): Promise<AuthenticatedUserPayload | null> {
  if (!rawToken || rawToken.length < 16) {
    return null;
  }

  const tokenHash = hashToken(rawToken);
  const dbOnline = await isDatabaseOnline();

  if (dbOnline) {
    const session = await prisma.userSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
            profile: true,
            wallet: true,
          },
        },
      },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      return null;
    }

    const { user } = session;
    if (user.status === "SUSPENDED") {
      return null;
    }

    let permissions: string[] = [];
    if (user.role.slug === ROLES.SUPER_ADMIN) {
      permissions = ["*"];
    } else {
      const explicit = user.role.rolePermissions.map((rp) => rp.permission.slug);
      permissions = explicit.length > 0 ? explicit : getPermissionsForRole(user.role.slug);
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      status: user.status,
      customerTier: user.customerTier,
      emailVerified: !!user.emailVerifiedAt,
      phoneVerified: !!user.phoneVerifiedAt,
      role: {
        id: user.role.id,
        name: user.role.name,
        slug: user.role.slug,
      },
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            avatarUrl: user.profile.avatarUrl,
          }
        : null,
      wallet: user.wallet
        ? {
            id: user.wallet.id,
            currentBalance: user.wallet.currentBalance.toString(),
            ledgerBalance: user.wallet.ledgerBalance.toString(),
            status: user.wallet.status,
          }
        : null,
      permissions,
    };
  }

  // Fallback: In-Memory
  const storedSession = memoryStore.getSession(tokenHash);
  if (!storedSession) {
    return null;
  }

  const user = memoryStore.findUserById(storedSession.userId);
  if (!user || user.status === "SUSPENDED") {
    return null;
  }

  const wallet = memoryStore.getWallet(user.id);
  const permissions = getPermissionsForRole(user.roleSlug);

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    status: user.status,
    customerTier: user.customerTier,
    emailVerified: !!user.emailVerifiedAt,
    phoneVerified: !!user.phoneVerifiedAt,
    role: {
      id: user.roleId,
      name: user.roleName,
      slug: user.roleSlug,
    },
    profile: {
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: null,
    },
    wallet: wallet
      ? {
          id: wallet.id,
          currentBalance: wallet.currentBalance,
          ledgerBalance: wallet.ledgerBalance,
          status: wallet.status,
        }
      : null,
    permissions,
  };
}

/**
 * Revokes a session token (Logout).
 */
export async function logout(rawToken: string): Promise<void> {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  const dbOnline = await isDatabaseOnline();

  if (dbOnline) {
    try {
      await prisma.userSession.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    } catch {
      // safe noop
    }
  }

  memoryStore.revokeSession(tokenHash);
}

/**
 * Initiates password recovery.
 * Generates a verification token and returns it (for email dispatch or test inspection).
 */
export async function requestPasswordReset(email: string): Promise<{ token?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const rawToken = generateRandomToken(32);
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + AUTH_CONFIG.PASSWORD_RESET_EXPIRATION_HOURS);

  const dbOnline = await isDatabaseOnline();

  if (dbOnline) {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Always return silently to prevent user enumeration
    if (!user) {
      return {};
    }

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: "PASSWORD_RESET",
        expiresAt,
      },
    });

    return { token: rawToken };
  }

  const user = memoryStore.findUserByEmailOrPhone(cleanEmail);
  if (!user) {
    return {};
  }

  memoryStore.saveToken({
    id: `tok-${Date.now()}`,
    userId: user.id,
    tokenHash,
    type: "PASSWORD_RESET",
    expiresAt,
    isUsed: false,
    usedAt: null,
    createdAt: new Date(),
  });

  return { token: rawToken };
}

/**
 * Resets a user password using a verified token.
 * Revokes all previous sessions to prevent session hijacking.
 */
export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const hashedPassword = hashPassword(newPassword);
  const dbOnline = await isDatabaseOnline();

  if (dbOnline) {
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.type !== "PASSWORD_RESET" ||
      tokenRecord.isUsed ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new ValidationError("Password reset token is invalid or has expired.");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash: hashedPassword },
      }),
      prisma.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { isUsed: true, usedAt: new Date() },
      }),
      prisma.userSession.updateMany({
        where: { userId: tokenRecord.userId },
        data: { isRevoked: true },
      }),
    ]);

    return;
  }

  // Memory fallback
  const storedToken = memoryStore.getToken(tokenHash);
  if (
    !storedToken ||
    storedToken.type !== "PASSWORD_RESET" ||
    storedToken.isUsed ||
    storedToken.expiresAt < new Date()
  ) {
    throw new ValidationError("Password reset token is invalid or has expired.");
  }

  memoryStore.updateUser(storedToken.userId, { passwordHash: hashedPassword });
  memoryStore.markTokenUsed(tokenHash);
  memoryStore.revokeAllUserSessions(storedToken.userId);
}

/**
 * Verifies email address using verification token.
 */
export async function verifyEmail(rawToken: string): Promise<{ email: string }> {
  const tokenHash = hashToken(rawToken);
  const dbOnline = await isDatabaseOnline();

  if (dbOnline) {
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.type !== "EMAIL_VERIFICATION" ||
      tokenRecord.isUsed ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new ValidationError("Email verification link is invalid or has expired.");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: {
          emailVerifiedAt: new Date(),
          status: "ACTIVE",
        },
      }),
      prisma.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { isUsed: true, usedAt: new Date() },
      }),
    ]);

    return { email: tokenRecord.user.email };
  }

  // Memory fallback
  const storedToken = memoryStore.getToken(tokenHash);
  if (
    !storedToken ||
    storedToken.type !== "EMAIL_VERIFICATION" ||
    storedToken.isUsed ||
    storedToken.expiresAt < new Date()
  ) {
    throw new ValidationError("Email verification link is invalid or has expired.");
  }

  const updated = memoryStore.updateUser(storedToken.userId, {
    emailVerifiedAt: new Date(),
    status: "ACTIVE",
  });
  memoryStore.markTokenUsed(tokenHash);

  return { email: updated?.email ?? "" };
}

/**
 * Resends email verification token.
 */
export async function resendVerificationToken(email: string): Promise<{ token?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const rawToken = generateRandomToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + AUTH_CONFIG.EMAIL_VERIFICATION_EXPIRATION_HOURS);

  const dbOnline = await isDatabaseOnline();

  if (dbOnline) {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || user.emailVerifiedAt) {
      return {};
    }

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    return { token: rawToken };
  }

  const user = memoryStore.findUserByEmailOrPhone(cleanEmail);
  if (!user || user.emailVerifiedAt) {
    return {};
  }

  memoryStore.saveToken({
    id: `tok-${Date.now()}`,
    userId: user.id,
    tokenHash,
    type: "EMAIL_VERIFICATION",
    expiresAt,
    isUsed: false,
    usedAt: null,
    createdAt: new Date(),
  });

  return { token: rawToken };
}
