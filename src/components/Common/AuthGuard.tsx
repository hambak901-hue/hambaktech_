"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders, clearStoredAuthToken } from "@/lib/auth-token";
import BrandLogo from "@/components/Common/BrandLogo";
import { ShieldAlert, RefreshCw, ArrowLeft, LogOut } from "lucide-react";

export interface AuthenticatedUser {
  id: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  customerTier?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    kycTier?: string;
    kycStatus?: string;
  };
  wallet?: {
    balance?: number;
    currentBalance?: number;
    ledgerBalance?: number;
    currency?: string;
    status?: string;
  };
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallbackRedirect?: string;
}

export default function AuthGuard({
  children,
  allowedRoles,
  fallbackRedirect = "/signin",
}: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(getApiUrl("/api/auth/me"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Unauthenticated");
      }

      const data = await res.json();
      const rawUser = data?.data?.user || data?.data;
      if (!data?.success || !rawUser || !rawUser.id) {
        throw new Error("Invalid session response");
      }

      const roleSlug = (
        typeof rawUser.role === "string"
          ? rawUser.role
          : rawUser.role?.slug || "customer"
      ).toLowerCase();

      const normalizedUser: AuthenticatedUser = {
        id: rawUser.id,
        email: rawUser.email,
        phone: rawUser.phone,
        role: roleSlug,
        status: rawUser.status || "ACTIVE",
        customerTier: rawUser.customer_tier || rawUser.customerTier || "STANDARD",
        profile: rawUser.profile || {
          firstName: rawUser.firstName || rawUser.first_name,
          lastName: rawUser.lastName || rawUser.last_name,
          name: rawUser.name,
          kycTier: rawUser.kycTier || rawUser.kyc_tier,
          kycStatus: rawUser.kycStatus || rawUser.kyc_status,
        },
        wallet: rawUser.wallet,
      };

      setUser(normalizedUser);

      // Check role authorization if restricted
      if (allowedRoles && allowedRoles.length > 0) {
        const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
        if (!normalizedAllowed.includes(roleSlug)) {
          setForbidden(true);
          setLoading(false);
          return;
        }
      }

      setForbidden(false);
      setLoading(false);
    } catch {
      // Unauthenticated visitor attempting to access protected route
      setUser(null);
      setLoading(false);
      const redirectUrl = `${fallbackRedirect}?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch(getApiUrl("/api/auth/logout"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
    } catch {
      // Fallback
    } finally {
      clearStoredAuthToken();
      setUser(null);
      router.push("/signin");
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="flex justify-center mb-2">
            <BrandLogo variant="stacked" size="md" />
          </div>
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Verifying authenticated session...</span>
          </div>
          <p className="text-xs text-body-color">
            Checking server-authoritative credentials and permissions.
          </p>
        </div>
      </div>
    );
  }

  // 2. 403 Forbidden Access Denied State (Authenticated user lacks role permission)
  if (forbidden && user) {
    const isCustomerInAdmin = !["super_admin", "admin", "support_admin", "manager", "staff"].includes(user.role);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-dark-2 rounded-3xl border border-red-200 dark:border-red-900/50 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 uppercase tracking-wider">
              403 Access Denied
            </span>
            <h2 className="text-xl font-bold text-dark dark:text-white">
              Insufficient Privileges
            </h2>
            <p className="text-xs text-body-color leading-relaxed">
              Your account is authenticated as{" "}
              <strong className="text-dark dark:text-white uppercase font-bold">
                {user.role}
              </strong>
              . This operational area is restricted to administrative personnel with verified clearance.
            </p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-dark rounded-xl text-left text-xs space-y-1">
            <div className="text-body-color flex justify-between">
              <span>Account:</span>
              <span className="font-semibold text-dark dark:text-white">{user.email}</span>
            </div>
            <div className="text-body-color flex justify-between">
              <span>Required Role:</span>
              <span className="font-mono text-red-600 dark:text-red-400 font-bold">
                {allowedRoles?.join(" / ")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {isCustomerInAdmin ? (
              <Link
                href="/dashboard"
                className="w-full py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Customer Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="w-full py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl border border-stroke dark:border-strokedark text-xs font-semibold text-body-color hover:text-red-600 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign In with Different Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is null (transitioning to signin)
  if (!user) {
    return null;
  }

  // 4. Authorized
  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        logout: handleLogout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
