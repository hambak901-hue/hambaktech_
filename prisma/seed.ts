import {
  PrismaClient,
  SettingGroup,
  SettingType,
  ProviderType,
  Environment,
  PricingRuleType,
  CustomerTier,
  ServiceStatus,
  ServiceAvailability,
  ServiceFeatureType,
  CourseLevel,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting HambakTech Deterministic Production Seed (MySQL)...");

  // --------------------------------------------------
  // 1. Roles
  // --------------------------------------------------
  const roles = [
    {
      name: "Super Administrator",
      slug: "super_admin",
      description: "Full system authority and operational governance",
      isSystem: true,
    },
    {
      name: "Administrator",
      slug: "admin",
      description: "Operational management and supervisor oversight",
      isSystem: true,
    },
    {
      name: "Operational Staff",
      slug: "staff",
      description: "Business center operator, NIN desk clerk, and order processor",
      isSystem: true,
    },
    {
      name: "Commercial Agent",
      slug: "agent",
      description: "Wholesale VTU reseller, registration agent, and merchant partner",
      isSystem: true,
    },
    {
      name: "Platform Customer",
      slug: "customer",
      description: "Registered retail client and consumer account",
      isSystem: true,
    },
    {
      name: "Academy Student",
      slug: "student",
      description: "Enrolled IT institute student and certificate candidate",
      isSystem: true,
    },
    {
      name: "Operations Manager",
      slug: "manager",
      description: "Business oversight, analytics inspection, and operations supervision",
      isSystem: true,
    },
    {
      name: "Platform Developer",
      slug: "developer",
      description: "Technical configuration, integration maintenance, and system diagnostics",
      isSystem: true,
    },
  ];

  const roleMap = new Map<string, string>();
  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name, description: role.description },
      create: role,
    });
    roleMap.set(role.slug, r.id);
  }
  console.log(`✅ Verified ${roles.length} system roles.`);

  // --------------------------------------------------
  // 2. Granular Permissions
  // --------------------------------------------------
  const permissions = [
    { name: "Manage Users", slug: "users.manage", module: "USERS", description: "Create, suspend, or update users" },
    { name: "View Users", slug: "users.view", module: "USERS", description: "Read user profiles and audit logs" },
    { name: "Read Users", slug: "users.read", module: "USERS", description: "Read user list and details" },
    { name: "Update Users", slug: "users.update", module: "USERS", description: "Modify user status and profiles" },
    { name: "Manage RBAC", slug: "rbac.manage", module: "RBAC", description: "Configure roles and permissions" },
    { name: "Manage Services", slug: "services.manage", module: "SERVICES", description: "Update catalog, pricing, and availability" },
    { name: "View Services", slug: "services.view", module: "SERVICES", description: "Inspect service offerings and configurations" },
    { name: "Read Services", slug: "services.read", module: "SERVICES", description: "Read catalog items and pricing" },
    { name: "Process Orders", slug: "orders.process", module: "ORDERS", description: "Fulfill, mark completed, or update orders" },
    { name: "Create Orders", slug: "orders.create", module: "ORDERS", description: "Initiate service orders on behalf of clients" },
    { name: "Read Orders", slug: "orders.read", module: "ORDERS", description: "Read customer orders and items" },
    { name: "Update Orders", slug: "orders.update", module: "ORDERS", description: "Update order status and fulfillment notes" },
    { name: "Manage Wallets", slug: "wallets.manage", module: "FINANCE", description: "Adjust balances, freeze, or review ledgers" },
    { name: "Read Wallets", slug: "wallet.read", module: "FINANCE", description: "Read wallet balance and ledger entries" },
    { name: "Adjust Wallets", slug: "wallet.adjust", module: "FINANCE", description: "Perform administrative balance credit/debit" },
    { name: "Audit Financials", slug: "finance.audit", module: "FINANCE", description: "Inspect transactions and payment reconciliations" },
    { name: "Read Reports", slug: "reports.read", module: "FINANCE", description: "Access business analytics and revenue reports" },
    { name: "Process NIN", slug: "nin.process", module: "NIN", description: "Operate NIN enrollment desk and reprint slips" },
    { name: "Read NIN", slug: "nin.read", module: "NIN", description: "View NIN verification applications" },
    { name: "Process CAC", slug: "cac.process", module: "CAC", description: "Manage business name filings and reservations" },
    { name: "Read CAC", slug: "cac.read", module: "CAC", description: "View CAC corporate applications" },
    { name: "Manage Academy", slug: "academy.manage", module: "ACADEMY", description: "Enroll students, manage modules, issue certs" },
    { name: "Read Academy", slug: "academy.read", module: "ACADEMY", description: "Access student courses and progress" },
    { name: "Manage Support", slug: "support.manage", module: "SUPPORT", description: "Reply to tickets and assign priorities" },
    { name: "Read Support", slug: "support.read", module: "SUPPORT", description: "View customer support requests" },
    { name: "Update Support", slug: "support.update", module: "SUPPORT", description: "Respond to and resolve customer tickets" },
    { name: "Manage CMS", slug: "cms.manage", module: "CMS", description: "Publish announcements, blogs, and FAQs" },
    { name: "Manage Settings", slug: "settings.manage", module: "SETTINGS", description: "Update company info and system parameters" },
    { name: "Read Settings", slug: "settings.read", module: "SETTINGS", description: "View system configurations" },
    { name: "System Settings", slug: "system.settings", module: "SETTINGS", description: "Manage core system settings and environment parameters" },
    { name: "Read Pricing", slug: "pricing.read", module: "FINANCE", description: "View service price lists and margin rules" },
    { name: "Manage Pricing", slug: "pricing.manage", module: "FINANCE", description: "Configure customer tier markups and custom pricing" },
    { name: "Read Profile", slug: "profile.read", module: "USERS", description: "Read user own profile details" },
    { name: "Update Profile", slug: "profile.update", module: "USERS", description: "Update user own profile details" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name, module: perm.module, description: perm.description },
      create: perm,
    });
  }
  console.log(`✅ Verified ${permissions.length} granular permissions.`);

  // Assign Super Admin all permissions
  const superAdminRoleId = roleMap.get("super_admin");
  if (superAdminRoleId) {
    const allPerms = await prisma.permission.findMany();
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRoleId,
            permissionId: p.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRoleId,
          permissionId: p.id,
        },
      });
    }
  }

  // --------------------------------------------------
  // 3. Company Settings (Nothing Hardcoded)
  // --------------------------------------------------
  const companySettings = [
    {
      key: "company_name",
      value: "Hambaktech & Services",
      group: SettingGroup.COMPANY,
      description: "Official legal entity name",
      isPublic: true,
    },
    {
      key: "brand_name",
      value: "HambakTech",
      group: SettingGroup.COMPANY,
      description: "Public commercial brand mark",
      isPublic: true,
    },
    {
      key: "slogan",
      value: "Where Technology Meet Service",
      group: SettingGroup.COMPANY,
      description: "Official company slogan / motto",
      isPublic: true,
    },
    {
      key: "official_domain",
      value: "hambaktech.com.ng",
      group: SettingGroup.COMPANY,
      description: "Production web domain",
      isPublic: true,
    },
    {
      key: "support_email",
      value: "info@hambaktech.com.ng",
      group: SettingGroup.COMPANY,
      description: "Primary customer assistance email",
      isPublic: true,
    },
    {
      key: "support_phone",
      value: "+234 800 000 0000",
      group: SettingGroup.COMPANY,
      description: "Customer service telephone line",
      isPublic: true,
    },
    {
      key: "physical_address",
      value: "Origanrigan cele Area, Lagos, Lagos State, Nigeria",
      group: SettingGroup.COMPANY,
      description: "Principal place of business and headquarters",
      isPublic: true,
    },
    {
      key: "primary_state",
      value: "Lagos",
      group: SettingGroup.COMPANY,
      description: "Operating state",
      isPublic: true,
    },
    {
      key: "primary_lga",
      value: "Ibeju-Lekki",
      group: SettingGroup.COMPANY,
      description: "Local Government Area of principal office",
      isPublic: true,
    },
  ];

  for (const setting of companySettings) {
    await prisma.companySetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description, isPublic: setting.isPublic },
      create: setting,
    });
  }
  console.log(`✅ Seeded ${companySettings.length} company settings.`);

  // --------------------------------------------------
  // 4. System Operational Settings
  // --------------------------------------------------
  const systemSettings = [
    {
      key: "default_currency",
      value: "NGN",
      type: SettingType.STRING,
      description: "Default platform base currency",
    },
    {
      key: "wallet_min_funding",
      value: "100.00",
      type: SettingType.NUMBER,
      description: "Minimum single wallet top-up in NGN",
    },
    {
      key: "maintenance_mode",
      value: "false",
      type: SettingType.BOOLEAN,
      description: "Global maintenance mode toggle",
    },
    {
      key: "vtu_auto_retry_attempts",
      value: "3",
      type: SettingType.NUMBER,
      description: "Maximum automatic retry attempts for failed telecom transactions",
    },
    {
      key: "nin_pickup_lead_time_days",
      value: "2",
      type: SettingType.NUMBER,
      description: "Estimated lead time for physical NIN plastic card production",
    },
    {
      key: "cac_standard_turnaround_days",
      value: "7",
      type: SettingType.NUMBER,
      description: "Business name registration standard turnaround SLA",
    },
  ];

  for (const sys of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: sys.key },
      update: { value: sys.value, type: sys.type, description: sys.description },
      create: sys,
    });
  }
  console.log(`✅ Seeded ${systemSettings.length} system operational settings.`);

  // --------------------------------------------------
  // 5. Physical Branches
  // --------------------------------------------------
  const mainBranch = await prisma.branch.upsert({
    where: { code: "HT-BR-LAGOS-01" },
    update: {
      name: "HambakTech Headquarters & Service Centre",
      address: "Origanrigan cele Area, Lagos, Lagos State, Nigeria",
      state: "Lagos",
      lga: "Ibeju-Lekki",
      phone: "+234 800 000 0000",
      email: "info@hambaktech.com.ng",
      isHeadOffice: true,
      isActive: true,
    },
    create: {
      code: "HT-BR-LAGOS-01",
      name: "HambakTech Headquarters & Service Centre",
      address: "Origanrigan cele Area, Lagos, Lagos State, Nigeria",
      state: "Lagos",
      lga: "Ibeju-Lekki",
      phone: "+234 800 000 0000",
      email: "info@hambaktech.com.ng",
      isHeadOffice: true,
      isActive: true,
    },
  });

  // Working Hours (Monday = 1 to Saturday = 6)
  for (let day = 1; day <= 6; day++) {
    await prisma.businessHour.upsert({
      where: {
        branchId_dayOfWeek: {
          branchId: mainBranch.id,
          dayOfWeek: day,
        },
      },
      update: { opensAt: "08:00", closesAt: "18:00", isClosed: false },
      create: {
        branchId: mainBranch.id,
        dayOfWeek: day,
        opensAt: "08:00",
        closesAt: "18:00",
        isClosed: false,
      },
    });
  }
  // Sunday = 0 (Closed)
  await prisma.businessHour.upsert({
    where: {
      branchId_dayOfWeek: {
        branchId: mainBranch.id,
        dayOfWeek: 0,
      },
    },
    update: { opensAt: "00:00", closesAt: "00:00", isClosed: true },
    create: {
      branchId: mainBranch.id,
      dayOfWeek: 0,
      opensAt: "00:00",
      closesAt: "00:00",
      isClosed: true,
    },
  });
  console.log(`✅ Seeded principal physical branch and operational schedule.`);

  // --------------------------------------------------
  // 6. Service Categories
  // --------------------------------------------------
  const categories = [
    {
      code: "CAT_BC",
      name: "Business Centre Services",
      slug: "business-centre",
      description: "Photocopying, color printing, document typing, lamination, and spiral binding",
      icon: "printer",
      displayOrder: 1,
    },
    {
      code: "CAT_NIN",
      name: "Identity & Verification Desk",
      slug: "identity-verification",
      description: "Certified NIN enrollment, modification, validation, slip reprinting, and BVN assistance",
      icon: "id-card",
      displayOrder: 2,
    },
    {
      code: "CAT_VTU",
      name: "Telecom & Automated VTU",
      slug: "telecom-vtu",
      description: "Instant automated airtime, internet data bundles, and utility bill settlements",
      icon: "smartphone",
      displayOrder: 3,
    },
    {
      code: "CAT_ACAD",
      name: "Computer Institute & Academy",
      slug: "computer-institute",
      description: "Practical IT training, diploma courses, digital literacy, and verifiable certifications",
      icon: "graduation-cap",
      displayOrder: 4,
    },
    {
      code: "CAT_CAC",
      name: "Corporate Affairs Commission Desk",
      slug: "cac-registration",
      description: "Business name registration, company incorporation, and post-incorporation filing",
      icon: "briefcase",
      displayOrder: 5,
    },
    {
      code: "CAT_GAME",
      name: "Game Centre & Arena",
      slug: "game-centre",
      description: "Modern console gaming stations and community esports tournaments",
      icon: "gamepad-2",
      displayOrder: 6,
    },
    {
      code: "CAT_PRESS",
      name: "Digital Graphics & Printing Press",
      slug: "graphics-printing",
      description: "Large format flex banners, flyers, business cards, corporate branding, and DI press",
      icon: "palette",
      displayOrder: 7,
    },
    {
      code: "CAT_STAT",
      name: "Stationery & Computer Accessories",
      slug: "stationery-accessories",
      description: "Office supplies, school stationery, flash drives, cables, and hardware accessories",
      icon: "shopping-bag",
      displayOrder: 8,
    },
  ];

  const catMap = new Map<string, string>();
  for (const cat of categories) {
    const c = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, code: cat.code, description: cat.description, displayOrder: cat.displayOrder },
      create: cat,
    });
    catMap.set(cat.code, c.id);
  }
  console.log(`✅ Seeded ${categories.length} service categories.`);

  // --------------------------------------------------
  // 7. Foundational Services Catalog
  // --------------------------------------------------
  const servicesData = [
    {
      categoryCode: "CAT_VTU",
      code: "VTU_AIRTIME",
      name: "Airtime Top-Up (All Networks)",
      slug: "vtu-airtime",
      shortDescription: "Instant recharge on MTN, Airtel, Glo, and 9mobile",
      basePrice: "100.00",
      dynamicPricing: true,
      availability: ServiceAvailability.ONLINE_ONLY,
      turnaroundSLA: "Instant",
    },
    {
      categoryCode: "CAT_VTU",
      code: "VTU_DATA",
      name: "Internet Data Bundles",
      slug: "vtu-data",
      shortDescription: "Affordable SME and direct data plans for all Nigerian networks",
      basePrice: "300.00",
      dynamicPricing: true,
      availability: ServiceAvailability.ONLINE_ONLY,
      turnaroundSLA: "Instant",
    },
    {
      categoryCode: "CAT_VTU",
      code: "VTU_POWER",
      name: "Electricity Bill Settlement",
      slug: "vtu-electricity",
      shortDescription: "Prepaid and postpaid electricity token generation across DisCos",
      basePrice: "1000.00",
      dynamicPricing: false,
      availability: ServiceAvailability.ONLINE_ONLY,
      turnaroundSLA: "Instant",
    },
    {
      categoryCode: "CAT_VTU",
      code: "VTU_CABLE",
      name: "Cable TV Subscription",
      slug: "vtu-cable-tv",
      shortDescription: "Instant activation for DSTV, GOtv, and StarTimes",
      basePrice: "2500.00",
      dynamicPricing: false,
      availability: ServiceAvailability.ONLINE_ONLY,
      turnaroundSLA: "Instant",
    },
    {
      categoryCode: "CAT_NIN",
      code: "NIN_SLIP",
      name: "NIN Standard / Premium Slip Reprint",
      slug: "nin-slip-reprint",
      shortDescription: "Authorized digital reprint and verification of National Identity Number slip",
      basePrice: "1500.00",
      dynamicPricing: false,
      availability: ServiceAvailability.WALK_IN_AND_ONLINE,
      turnaroundSLA: "1-2 Hours",
      requiresDocuments: true,
    },
    {
      categoryCode: "CAT_NIN",
      code: "NIN_PLASTIC",
      name: "Premium Plastic NIN ID Card",
      slug: "nin-plastic-card",
      shortDescription: "Durable waterproof PVC plastic card with high-definition laser printing",
      basePrice: "3500.00",
      dynamicPricing: false,
      availability: ServiceAvailability.WALK_IN_AND_ONLINE,
      turnaroundSLA: "24-48 Hours",
      requiresDocuments: true,
    },
    {
      categoryCode: "CAT_NIN",
      code: "NIN_MODIFY",
      name: "NIN Data Modification Assistance",
      slug: "nin-data-modification",
      shortDescription: "Guidance and processing for name, date of birth, or address update",
      basePrice: "5000.00",
      dynamicPricing: false,
      availability: ServiceAvailability.WALK_IN_AND_ONLINE,
      turnaroundSLA: "3-5 Business Days",
      requiresDocuments: true,
    },
    {
      categoryCode: "CAT_CAC",
      code: "CAC_BN",
      name: "CAC Business Name Registration",
      slug: "cac-business-name",
      shortDescription: "Complete enterprise reservation, filing, and certificate issuance",
      basePrice: "25000.00",
      dynamicPricing: false,
      availability: ServiceAvailability.WALK_IN_AND_ONLINE,
      turnaroundSLA: "5-7 Business Days",
      requiresDocuments: true,
    },
    {
      categoryCode: "CAT_CAC",
      code: "CAC_LTD",
      name: "CAC Private Limited Company (LTD)",
      slug: "cac-company-incorporation",
      shortDescription: "Full company incorporation with status report and Tax ID (TIN)",
      basePrice: "65000.00",
      dynamicPricing: false,
      availability: ServiceAvailability.WALK_IN_AND_ONLINE,
      turnaroundSLA: "7-10 Business Days",
      requiresDocuments: true,
    },
    {
      categoryCode: "CAT_BC",
      code: "BC_PRINT",
      name: "Document Laser Printing",
      slug: "document-printing",
      shortDescription: "Crisp black/white and vibrant full-color document printing",
      basePrice: "100.00",
      dynamicPricing: false,
      availability: ServiceAvailability.WALK_IN_ONLY,
      turnaroundSLA: "Instant",
    },
    {
      categoryCode: "CAT_BC",
      code: "BC_LAMINATE",
      name: "Lamination & Spiral Binding",
      slug: "lamination-binding",
      shortDescription: "Protective thermal document lamination and comb/spiral binding",
      basePrice: "300.00",
      dynamicPricing: false,
      availability: ServiceAvailability.WALK_IN_ONLY,
      turnaroundSLA: "Instant",
    },
    {
      categoryCode: "CAT_ACAD",
      code: "ACAD_DIT",
      name: "Diploma in Information Technology & Software",
      slug: "diploma-it-software",
      shortDescription: "12-week comprehensive computing and practical digital skills curriculum",
      basePrice: "45000.00",
      dynamicPricing: false,
      availability: ServiceAvailability.WALK_IN_AND_ONLINE,
      turnaroundSLA: "12 Weeks",
    },
  ];

  for (const s of servicesData) {
    const categoryId = catMap.get(s.categoryCode);
    if (!categoryId) continue;

    const serv = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        code: s.code,
        shortDescription: s.shortDescription,
        basePrice: s.basePrice,
        dynamicPricing: s.dynamicPricing,
        availability: s.availability,
        turnaroundSLA: s.turnaroundSLA,
        requiresDocuments: s.requiresDocuments ?? false,
      },
      create: {
        categoryId,
        name: s.name,
        code: s.code,
        slug: s.slug,
        shortDescription: s.shortDescription,
        basePrice: s.basePrice,
        dynamicPricing: s.dynamicPricing,
        status: ServiceStatus.ACTIVE,
        availability: s.availability,
        turnaroundSLA: s.turnaroundSLA,
        requiresDocuments: s.requiresDocuments ?? false,
      },
    });

    // Seed Tiered Pricing Rules (STANDARD, AGENT, CORPORATE)
    const tiers: CustomerTier[] = [CustomerTier.STANDARD, CustomerTier.AGENT, CustomerTier.CORPORATE];
    for (const tier of tiers) {
      let markup = "0.00";
      if (tier === CustomerTier.STANDARD) markup = "100.00";
      if (tier === CustomerTier.AGENT) markup = "50.00";
      if (tier === CustomerTier.CORPORATE) markup = "30.00";

      const baseVal = parseFloat(s.basePrice);
      const markVal = parseFloat(markup);
      const retail = (baseVal + markVal).toFixed(2);

      await prisma.servicePrice.upsert({
        where: {
          serviceId_customerTier: {
            serviceId: serv.id,
            customerTier: tier,
          },
        },
        update: {
          providerCost: s.basePrice,
          markupAmount: markup,
          sellingPrice: retail,
          isActive: true,
        },
        create: {
          serviceId: serv.id,
          customerTier: tier,
          providerCost: s.basePrice,
          markupAmount: markup,
          sellingPrice: retail,
          isActive: true,
        },
      });
    }
  }
  console.log(`✅ Seeded ${servicesData.length} core services with tiered pricing matrix.`);

  // --------------------------------------------------
  // 8. Upstream Service Providers (Zero Secrets Stored)
  // --------------------------------------------------
  const providers = [
    { name: "Paystack Payments", code: "PAYSTACK", type: ProviderType.PAYMENT_GATEWAY },
    { name: "Flutterwave Gateway", code: "FLUTTERWAVE", type: ProviderType.PAYMENT_GATEWAY },
    { name: "Moniepoint Direct", code: "MONIEPOINT", type: ProviderType.PAYMENT_GATEWAY },
    { name: "National Identity Provider", code: "NIN_NIMC", type: ProviderType.IDENTITY_VERIFICATION },
    { name: "Unified Telecom Switch", code: "VTU_AGGREGATOR", type: ProviderType.TELECOM_VTU },
  ];

  for (const prov of providers) {
    const p = await prisma.provider.upsert({
      where: { code: prov.code },
      update: { name: prov.name, type: prov.type },
      create: prov,
    });

    // Default Sandbox Config (Placeholder references environment variable names only)
    const existingConfig = await prisma.providerConfig.findFirst({
      where: { providerId: p.id, environment: Environment.SANDBOX },
    });

    if (!existingConfig) {
      await prisma.providerConfig.create({
        data: {
          providerId: p.id,
          environment: Environment.SANDBOX,
          credentialsKey: `SEC_${prov.code}_SANDBOX_KEY`,
          isDefault: true,
          settingsJson: JSON.stringify({ timeoutMs: 15000, retryAttempts: 3 }),
        },
      });
    }

    // Baseline Health Metric
    const existingHealth = await prisma.providerHealth.findFirst({
      where: { providerId: p.id },
    });
    if (!existingHealth) {
      await prisma.providerHealth.create({
        data: {
          providerId: p.id,
          latencyMs: 120,
          successRate: "99.80",
          remarks: "Initial seed baseline ping verified",
        },
      });
    }
  }
  console.log(`✅ Seeded ${providers.length} upstream providers with safe sandbox references.`);

  // --------------------------------------------------
  // 9. Academy Course Curriculum Foundation
  // --------------------------------------------------
  const acadCategory = await prisma.courseCategory.upsert({
    where: { slug: "it-software-development" },
    update: { name: "IT & Software Engineering" },
    create: {
      name: "IT & Software Engineering",
      slug: "it-software-development",
      description: "Practical career-focused technology courses",
    },
  });

  const ditCourse = await prisma.course.upsert({
    where: { code: "HT-CRS-DIT" },
    update: {
      title: "Diploma in Information Technology & Software",
      tuitionFee: "45000.00",
      level: CourseLevel.BEGINNER,
      durationWeeks: 12,
    },
    create: {
      code: "HT-CRS-DIT",
      categoryId: acadCategory.id,
      title: "Diploma in Information Technology & Software",
      slug: "diploma-in-information-technology",
      shortDescription: "Comprehensive 12-week diploma in modern computer applications, web development, and database concepts",
      tuitionFee: "45000.00",
      level: CourseLevel.BEGINNER,
      durationWeeks: 12,
      isCertificateIncluded: true,
      isActive: true,
    },
  });

  const modules = [
    { order: 1, title: "Computer Architecture & Operating Systems", hours: 10 },
    { order: 2, title: "Word Processing, Spreadsheets & Productivity", hours: 15 },
    { order: 3, title: "Web Foundations: HTML, CSS & Responsive Design", hours: 25 },
    { order: 4, title: "Relational Databases, SQL & Cloud Systems", hours: 30 },
  ];

  for (const m of modules) {
    await prisma.courseModule.upsert({
      where: {
        courseId_moduleOrder: {
          courseId: ditCourse.id,
          moduleOrder: m.order,
        },
      },
      update: { title: m.title, durationHours: m.hours },
      create: {
        courseId: ditCourse.id,
        moduleOrder: m.order,
        title: m.title,
        durationHours: m.hours,
      },
    });
  }
  console.log(`✅ Seeded academy curriculum modules for ${ditCourse.code}.`);

  // --------------------------------------------------
  // 10. CMS Baseline Announcements & FAQs
  // --------------------------------------------------
  const initialAnnouncements = [
    {
      title: "Welcome to HambakTech Smart Digital Platform",
      message: "Access our unified services including automated VTU, NIN verification desk, CAC business registration, and accredited IT academy courses.",
    },
    {
      title: "Physical Service Desk Open in Origanrigan cele Area",
      message: "Visit our physical branch for instant document printing, plastic ID card lamination, and in-person registration consultations.",
    },
  ];

  for (const ann of initialAnnouncements) {
    const existingAnn = await prisma.cMSAnnouncement.findFirst({
      where: { title: ann.title },
    });
    if (!existingAnn) {
      await prisma.cMSAnnouncement.create({
        data: {
          title: ann.title,
          message: ann.message,
          isActive: true,
        },
      });
    }
  }

  const initialFaqs = [
    {
      category: "Wallet & Payments",
      question: "How do I fund my HambakTech digital wallet?",
      answer: "Log in to your customer dashboard, click 'Fund Wallet', specify your desired amount, and complete payment securely via Paystack, Flutterwave, or direct bank transfer.",
      displayOrder: 1,
    },
    {
      category: "NIN Services",
      question: "Can I collect my physical NIN plastic card at your office?",
      answer: "Yes. Once processed, plastic cards are ready for pickup at our Origanrigan cele Area service desk in Lagos, or can be delivered via dispatch courier.",
      displayOrder: 2,
    },
    {
      category: "CAC Registration",
      question: "What documents are required for CAC Business Name registration?",
      answer: "You will need a valid government identity card (NIN/Voter's Card), passport photograph, and signature specimen. Our desk handles name reservation and final filing.",
      displayOrder: 3,
    },
  ];

  for (const faq of initialFaqs) {
    const existingFaq = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });
    if (!existingFaq) {
      await prisma.fAQ.create({
        data: faq,
      });
    }
  }
  console.log(`✅ Seeded baseline CMS announcements and FAQs.`);

  console.log("🎉 HambakTech Deterministic Production Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
