-- =====================================================================
-- HAMBAKTECH SMART DIGITAL PLATFORM v1.0 — CANONICAL PRODUCTION SEED DATA
-- Target: MySQL 8.0+ / MariaDB 10.4+
-- Strictly System Bootstrap Data (Zero Fake Customers / Zero Fabricated Balances)
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. System Roles
-- ---------------------------------------------------------------------
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES
('role-super-admin', 'Super Administrator', 'super_admin', 'Full platform access, operational governance, and financial configuration', 1, NOW(), NOW()),
('role-admin', 'Platform Administrator', 'admin', 'Operations, staff supervision, order fulfillment, and user administration', 1, NOW(), NOW()),
('role-staff', 'Operational Staff', 'staff', 'Order processing, student management, counter services, and ticket replies', 1, NOW(), NOW()),
('role-agent', 'Business Agent / Reseller', 'agent', 'Wholesale pricing, VTU bulk resale, CAC desk partner, and regional liaison', 1, NOW(), NOW()),
('role-customer', 'Retail Customer', 'customer', 'Standard retail services, personal wallet, order placement, and tracking', 1, NOW(), NOW()),
('role-student', 'Academy Student', 'student', 'Course enrollment, assignments, student ID credentials, and certificates', 1, NOW(), NOW()),
('role-corporate', 'Corporate Client', 'corporate', 'Post-incorporation retainers, custom design, and volume orders', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`);

-- ---------------------------------------------------------------------
-- 2. Granular Permissions
-- ---------------------------------------------------------------------
INSERT INTO `permissions` (`id`, `name`, `slug`, `module`, `description`) VALUES
('p-user-read', 'Read Users', 'users.read', 'users', 'View user profiles and account records'),
('p-user-write', 'Manage Users', 'users.update', 'users', 'Create, update, and manage user accounts'),
('p-wallet-read', 'Read Wallet', 'wallet.read', 'wallet', 'View personal or managed wallet balances and ledgers'),
('p-wallet-adjust', 'Adjust Wallet', 'wallet.adjust', 'wallet', 'Administrative balance credits, debits, and adjustments'),
('p-order-create', 'Create Order', 'orders.create', 'orders', 'Submit new service orders and catalog purchases'),
('p-order-update', 'Update Order', 'orders.update', 'orders', 'Process and transition order states through fulfillment'),
('p-services-manage', 'Manage Services', 'services.manage', 'services', 'Configure offerings, categories, and service specifications'),
('p-pricing-manage', 'Manage Pricing', 'pricing.manage', 'pricing', 'Update tier rates, rules, and customer margins'),
('p-system-settings', 'System Settings', 'system.settings', 'system', 'Configure platform parameters and service providers'),
('p-academy-manage', 'Manage Academy', 'academy.manage', 'academy', 'Oversee courses, enrollments, student records, and certificates'),
('p-support-manage', 'Manage Support', 'support.manage', 'support', 'Answer customer tickets, update priorities, and resolve inquiries'),
('p-identity-ops', 'Identity Operations', 'identity.manage', 'identity', 'Process NIN verification, reprint slips, and CAC registration desks')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`);

-- ---------------------------------------------------------------------
-- 3. System Role-Permission Mappings (RBAC Matrix)
-- ---------------------------------------------------------------------
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `created_at`) VALUES
-- Super Admin: Full Platform Authority
('rp-sa-user-read', 'role-super-admin', 'p-user-read', NOW()),
('rp-sa-user-write', 'role-super-admin', 'p-user-write', NOW()),
('rp-sa-wallet-read', 'role-super-admin', 'p-wallet-read', NOW()),
('rp-sa-wallet-adjust', 'role-super-admin', 'p-wallet-adjust', NOW()),
('rp-sa-order-create', 'role-super-admin', 'p-order-create', NOW()),
('rp-sa-order-update', 'role-super-admin', 'p-order-update', NOW()),
('rp-sa-services-manage', 'role-super-admin', 'p-services-manage', NOW()),
('rp-sa-pricing-manage', 'role-super-admin', 'p-pricing-manage', NOW()),
('rp-sa-system-settings', 'role-super-admin', 'p-system-settings', NOW()),
('rp-sa-academy-manage', 'role-super-admin', 'p-academy-manage', NOW()),
('rp-sa-support-manage', 'role-super-admin', 'p-support-manage', NOW()),
('rp-sa-identity-ops', 'role-super-admin', 'p-identity-ops', NOW()),

-- Admin: Operational & Supervisor Authority
('rp-adm-user-read', 'role-admin', 'p-user-read', NOW()),
('rp-adm-user-write', 'role-admin', 'p-user-write', NOW()),
('rp-adm-wallet-read', 'role-admin', 'p-wallet-read', NOW()),
('rp-adm-order-create', 'role-admin', 'p-order-create', NOW()),
('rp-adm-order-update', 'role-admin', 'p-order-update', NOW()),
('rp-adm-services-manage', 'role-admin', 'p-services-manage', NOW()),
('rp-adm-pricing-manage', 'role-admin', 'p-pricing-manage', NOW()),
('rp-adm-academy-manage', 'role-admin', 'p-academy-manage', NOW()),
('rp-adm-support-manage', 'role-admin', 'p-support-manage', NOW()),
('rp-adm-identity-ops', 'role-admin', 'p-identity-ops', NOW()),

-- Staff: Operational Desk Authority
('rp-stf-user-read', 'role-staff', 'p-user-read', NOW()),
('rp-stf-order-create', 'role-staff', 'p-order-create', NOW()),
('rp-stf-order-update', 'role-staff', 'p-order-update', NOW()),
('rp-stf-support-manage', 'role-staff', 'p-support-manage', NOW()),
('rp-stf-identity-ops', 'role-staff', 'p-identity-ops', NOW()),

-- Customer: Consumer Level Authority
('rp-cst-order-create', 'role-customer', 'p-order-create', NOW()),
('rp-cst-wallet-read', 'role-customer', 'p-wallet-read', NOW()),

-- Student: Learner Authority
('rp-stu-order-create', 'role-student', 'p-order-create', NOW()),
('rp-stu-wallet-read', 'role-student', 'p-wallet-read', NOW()),

-- Agent: Wholesale & Reseller Authority
('rp-agt-order-create', 'role-agent', 'p-order-create', NOW()),
('rp-agt-wallet-read', 'role-agent', 'p-wallet-read', NOW()),

-- Corporate Client Authority
('rp-crp-order-create', 'role-corporate', 'p-order-create', NOW()),
('rp-crp-wallet-read', 'role-corporate', 'p-wallet-read', NOW())
ON DUPLICATE KEY UPDATE `permission_id`=VALUES(`permission_id`);

-- ---------------------------------------------------------------------
-- 4. Service Categories
-- ---------------------------------------------------------------------
INSERT INTO `service_categories` (`id`, `name`, `slug`, `code`, `description`, `sort_order`, `is_active`) VALUES
('cat-vtu', 'Telecom VTU & Utilities', 'telecom-vtu', 'VTU', 'Airtime top-up, data bundles, electricity disco tokens', 1, 1),
('cat-biz', 'Business Centre & Secretarial', 'business-centre', 'BUSINESS_CENTRE', 'Photocopying, typesetting, scanning, lamination', 2, 1),
('cat-print', 'Printing & PVC Cards', 'printing', 'PRINTING', 'Plastic NIN card prints, official staff ID cards, flyers', 3, 1),
('cat-graph', 'Graphics & Visual Design', 'graphics', 'GRAPHICS', 'Brand identity, logos, event flyers, collateral', 4, 1),
('cat-web', 'Web & Software Engineering', 'software', 'SOFTWARE', 'Responsive websites, custom portal development', 5, 1),
('cat-nin', 'NIN Identity Operations', 'nin-identity', 'NIN_ID', 'NIN verification, premium slip reprints, PVC issuance', 6, 1),
('cat-cac', 'CAC Corporate Liaison', 'cac-registration', 'CAC_REG', 'Business name reservations, corporate registration', 7, 1),
('cat-acad', 'Computer Training Academy', 'academy', 'ACADEMY', 'Vocational computer literacy, desktop publishing, web design', 8, 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`);

-- ---------------------------------------------------------------------
-- 5. Canonical Service Catalog (Baseline Offerings)
-- ---------------------------------------------------------------------
INSERT INTO `service_offerings` (`id`, `category_id`, `title`, `slug`, `code`, `base_price`, `agent_price`, `corporate_price`, `is_active`) VALUES
('srv-nin-pvc', 'cat-nin', 'Plastic NIN Card Printing', 'nin-pvc-card', 'NIN_PVC', 1500.00, 1200.00, 1000.00, 1),
('srv-cac-bn', 'cat-cac', 'CAC Business Name Registration', 'cac-business-name', 'CAC_BN', 25000.00, 22000.00, 20000.00, 1),
('srv-cac-ltd', 'cat-cac', 'CAC Limited Liability Company', 'cac-ltd-company', 'CAC_LTD', 60000.00, 55000.00, 50000.00, 1),
('srv-cert-lam', 'cat-biz', 'A4 Document Lamination', 'a4-lamination', 'LAM_A4', 500.00, 400.00, 350.00, 1),
('srv-logo-des', 'cat-graph', 'Professional Corporate Logo Design', 'logo-design', 'LOGO_DSN', 15000.00, 12000.00, 10000.00, 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`), `base_price`=VALUES(`base_price`), `agent_price`=VALUES(`agent_price`), `corporate_price`=VALUES(`corporate_price`);

-- ---------------------------------------------------------------------
-- 6. Canonical Academy Courses
-- ---------------------------------------------------------------------
INSERT INTO `academy_courses` (`id`, `title`, `slug`, `code`, `level`, `category`, `duration_weeks`, `tuition_fee`, `instructor_name`, `description`, `is_active`) VALUES
('crs-dla-01', 'Certificate in Desktop Publishing & Office Productivity', 'desktop-publishing', 'HT-ACAD-DTP', 'BEGINNER', 'Computer Literacy', 8, 35000.00, 'Engr. Hammed Bakare', 'Master Microsoft Word, Excel, PowerPoint, and professional document production.', 1),
('crs-gda-02', 'Professional Graphic Design Masterclass', 'graphic-design', 'HT-ACAD-GDA', 'INTERMEDIATE', 'Creative Design', 10, 50000.00, 'Engr. Hammed Bakare', 'Industry-standard vector graphics, typography, CorelDraw, and Adobe Suite.', 1),
('crs-wda-03', 'Full Stack Web & Software Engineering', 'web-development', 'HT-ACAD-WDA', 'ADVANCED', 'Software Engineering', 16, 95000.00, 'Engr. Hammed Bakare', 'Modern frontend with React/Next.js, backend APIs, MySQL databases, and hosting.', 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`), `tuition_fee`=VALUES(`tuition_fee`);

-- ---------------------------------------------------------------------
-- 7. Delivery Zones (Ibeju-Lekki & Lagos East Operational Hubs)
-- ---------------------------------------------------------------------
INSERT INTO `delivery_zones` (`id`, `name`, `lga`, `delivery_fee`, `estimated_hours`, `is_active`) VALUES
('zone-eleko', 'Eleko Junction / Beach Road', 'Ibeju-Lekki', 1000.00, 4, 1),
('zone-bogije', 'Bogije / Shapati Axis', 'Ibeju-Lekki', 1500.00, 6, 1),
('zone-lakowe', 'Lakowe / Golf Course Phase', 'Ibeju-Lekki', 1800.00, 6, 1),
('zone-awoyaya', 'Awoyaya / Mayfair Gardens', 'Ibeju-Lekki', 2000.00, 8, 1),
('zone-epe', 'Epe Town / T-Junction', 'Epe', 3500.00, 24, 1),
('zone-ajah', 'Ajah / Sangotedo / Jubilee Bridge', 'Eti-Osa', 3000.00, 24, 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `delivery_fee`=VALUES(`delivery_fee`);

-- ---------------------------------------------------------------------
-- 8. System Settings (Nothing Hardcoded)
-- ---------------------------------------------------------------------
INSERT INTO `system_settings` (`key`, `value`, `description`) VALUES
('app_name', 'HambakTech Smart Digital Platform', 'Public platform name'),
('company_email', 'support@hambaktech.com.ng', 'Primary support and notification email'),
('company_phone', '08147837664', 'Customer care phone line'),
('physical_address', 'Suite 4, Eleko Junction Commercial Plaza, Ibeju-Lekki, Lagos', 'Office address'),
('currency', 'NGN', 'Platform base currency'),
('otp_expiry_minutes', '15', 'Time window for password reset OTP'),
('rate_limit_per_minute', '60', 'Standard API rate limit per client IP')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);

SET FOREIGN_KEY_CHECKS = 1;
