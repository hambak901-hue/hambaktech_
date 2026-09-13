import { PrismaClient, SettingGroup, SettingType, ProviderType, Environment, RuleType, FeeCalculationType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting HambakTech Core Architecture Seed...");

  // 1. System Roles
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
      description: "Operational management and customer supervision",
      isSystem: true,
    },
    {
      name: "Operational Staff",
      slug: "staff",
      description: "Business center agent, NIN desk, and order fulfillment",
      isSystem: true,
    },
    {
      name: "Customer",
      slug: "customer",
      description: "Registered platform customer and service client",
      isSystem: true,
    },
    {
      name: "Academy Student",
      slug: "student",
      description: "Enrolled IT institute student",
      isSystem: true,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }
  console.log(`✅ Verified ${roles.length} system roles.`);

  // 2. Foundational Permissions
  const permissions = [
    { name: "Manage Users", slug: "users.manage", module: "USERS" },
    { name: "View Users", slug: "users.view", module: "USERS" },
    { name: "Manage Roles", slug: "roles.manage", module: "RBAC" },
    { name: "Manage Services", slug: "services.manage", module: "SERVICES" },
    { name: "View Services", slug: "services.view", module: "SERVICES" },
    { name: "Process Orders", slug: "orders.process", module: "ORDERS" },
    { name: "Create Orders", slug: "orders.create", module: "ORDERS" },
    { name: "Manage Wallets", slug: "wallets.manage", module: "FINANCE" },
    { name: "Audit Financials", slug: "finance.audit", module: "FINANCE" },
    { name: "Manage Settings", slug: "settings.manage", module: "SETTINGS" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name, module: perm.module },
      create: perm,
    });
  }
  console.log(`✅ Verified ${permissions.length} core permissions.`);

  // 3. Company Settings (Nothing Hardcoded)
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
      description: "Official company motto",
      isPublic: true,
    },
    {
      key: "official_domain",
      value: "hambaktech.com.ng",
      group: SettingGroup.COMPANY,
      description: "Official production web domain",
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
      key: "physical_address",
      value: "Origanrigan cele Area, Lagos, Lagos State, Nigeria",
      group: SettingGroup.COMPANY,
      description: "Principal place of business",
      isPublic: true,
    },
    {
      key: "primary_lga",
      value: "Ibeju-Lekki",
      group: SettingGroup.COMPANY,
      description: "Local Government Area",
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

  // 4. System Operational Settings
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
      description: "Global maintenance mode flag",
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

  // 5. Service Categories
  const categories = [
    {
      name: "Business Centre Services",
      slug: "business-centre",
      description: "Photocopying, color printing, document typing, lamination, and spiral binding",
      icon: "printer",
      displayOrder: 1,
    },
    {
      name: "Identity & Verification Desk",
      slug: "identity-verification",
      description: "Certified NIN enrollment, modification, validation, slip reprinting, and BVN assistance",
      icon: "id-card",
      displayOrder: 2,
    },
    {
      name: "Telecom & Automated VTU",
      slug: "telecom-vtu",
      description: "Instant automated airtime, internet data bundles, and utility bill settlements",
      icon: "smartphone",
      displayOrder: 3,
    },
    {
      name: "Computer Institute & Academy",
      slug: "computer-institute",
      description: "Practical IT training, diploma courses, digital literacy, and verifiable certifications",
      icon: "graduation-cap",
      displayOrder: 4,
    },
    {
      name: "Game Centre & Arena",
      slug: "game-centre",
      description: "Modern console gaming stations and community esports tournaments",
      icon: "gamepad-2",
      displayOrder: 5,
    },
    {
      name: "Digital Graphics & Printing Press",
      slug: "graphics-printing",
      description: "Large format flex banners, flyers, business cards, corporate branding, and DI press",
      icon: "palette",
      displayOrder: 6,
    },
    {
      name: "Stationery & Computer Accessories",
      slug: "stationery-accessories",
      description: "Office supplies, school stationery, flash drives, cables, and hardware accessories",
      icon: "shopping-bag",
      displayOrder: 7,
    },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, displayOrder: cat.displayOrder },
      create: cat,
    });
  }
  console.log(`✅ Seeded ${categories.length} service categories.`);

  // 6. Upstream Providers
  const providers = [
    { name: "Paystack Gateway", code: "PAYSTACK", type: ProviderType.PAYMENT_GATEWAY },
    { name: "Flutterwave Gateway", code: "FLUTTERWAVE", type: ProviderType.PAYMENT_GATEWAY },
    { name: "Moniepoint Gateway", code: "MONIEPOINT", type: ProviderType.PAYMENT_GATEWAY },
    { name: "National Identity Provider", code: "NIN_NIMC", type: ProviderType.IDENTITY_VERIFICATION },
    { name: "Unified VTU Switch", code: "VTU_AGGREGATOR", type: ProviderType.TELECOM_VTU },
  ];

  for (const prov of providers) {
    const p = await prisma.provider.upsert({
      where: { code: prov.code },
      update: { name: prov.name, type: prov.type },
      create: prov,
    });

    // Default Sandbox Config
    const existingConfig = await prisma.providerConfig.findFirst({
      where: { providerId: p.id, environment: Environment.SANDBOX },
    });

    if (!existingConfig) {
      await prisma.providerConfig.create({
        data: {
          providerId: p.id,
          environment: Environment.SANDBOX,
          credentialsKey: `SEC_${prov.code}_TEST`,
          isDefault: true,
          settingsJson: JSON.stringify({ timeoutMs: 15000, retryAttempts: 3 }),
        },
      });
    }
  }
  console.log(`✅ Seeded ${providers.length} upstream providers with sandbox configurations.`);

  console.log("🎉 HambakTech Core Architecture Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
