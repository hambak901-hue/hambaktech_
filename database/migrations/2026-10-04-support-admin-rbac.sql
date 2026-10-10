-- =====================================================================
-- HAMBAKTECH DATABASE MIGRATION: 2026-10-04
-- Support Admin & Manager Roles, Permissions & Account Provisioning
-- Target: MySQL 8.0+ / MariaDB 10.4+ on Truehost cPanel
-- Non-destructive: Safe to run on live production database
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Ensure Roles Exist
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES
('role-support-admin', 'Support Administrator', 'support_admin', 'Customer support, order status inspection, inquiry management, and academy review', 1, NOW(), NOW()),
('role-manager', 'Operations Manager', 'manager', 'Operational workflows, supervisor review, ticket escalation, and inventory', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`);

-- 2. Role Permissions Mapping
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `created_at`) VALUES
-- Support Admin: Customer Support & Desk Supervision (Never adjustments/settings/promotions)
('rp-supadm-user-read', 'role-support-admin', 'p-user-read', NOW()),
('rp-supadm-order-create', 'role-support-admin', 'p-order-create', NOW()),
('rp-supadm-order-update', 'role-support-admin', 'p-order-update', NOW()),
('rp-supadm-support-manage', 'role-support-admin', 'p-support-manage', NOW()),
('rp-supadm-services-manage', 'role-support-admin', 'p-services-manage', NOW()),
('rp-supadm-academy-manage', 'role-support-admin', 'p-academy-manage', NOW()),
('rp-supadm-identity-ops', 'role-support-admin', 'p-identity-ops', NOW()),

-- Manager: Operations Supervision
('rp-mgr-user-read', 'role-manager', 'p-user-read', NOW()),
('rp-mgr-order-create', 'role-manager', 'p-order-create', NOW()),
('rp-mgr-order-update', 'role-manager', 'p-order-update', NOW()),
('rp-mgr-support-manage', 'role-manager', 'p-support-manage', NOW()),
('rp-mgr-services-manage', 'role-manager', 'p-services-manage', NOW()),
('rp-mgr-academy-manage', 'role-manager', 'p-academy-manage', NOW()),
('rp-mgr-identity-ops', 'role-manager', 'p-identity-ops', NOW())
ON DUPLICATE KEY UPDATE `permission_id`=VALUES(`permission_id`);

-- 3. Super Admin Guarantee: Ensure Root Super Admin is Active and Uncompromised
INSERT INTO `users` (`id`, `email`, `phone`, `password_hash`, `status`, `customer_tier`, `email_verified_at`, `role_id`, `created_at`, `updated_at`) VALUES
('usr-super-admin-root', 'hambak901@gmail.com', '+2348000000000', 'pbkdf2$100000$4f4f9944ad0c319a2548341173faae8d$1aa6a7c184bc4e2155d23dbf7144ec0b4208d5968e9493ff7832dce9868339de2e7b73f22bf89eb7a376e3d50e00ee995dd1ac65d3bbadcee3b12e6bbaa12adc', 'ACTIVE', 'CORPORATE', NOW(), 'role-super-admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE `status`='ACTIVE', `role_id`='role-super-admin';

INSERT INTO `user_profiles` (`id`, `user_id`, `first_name`, `last_name`, `kyc_tier`, `kyc_status`, `created_at`, `updated_at`) VALUES
('prof-super-admin-root', 'usr-super-admin-root', 'Hambak', 'SuperAdmin', 'TIER_3', 'VERIFIED', NOW(), NOW())
ON DUPLICATE KEY UPDATE `first_name`='Hambak', `last_name`='SuperAdmin';

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `ledger_balance`, `currency`, `status`, `created_at`, `updated_at`) VALUES
('wal-super-admin-root', 'usr-super-admin-root', 1000000.00, 1000000.00, 'NGN', 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE `status`='ACTIVE';

-- 4. Support Admin Provisioning: admin@hambaktech.com.ng (HambakTech@2026!)
INSERT INTO `users` (`id`, `email`, `phone`, `password_hash`, `status`, `customer_tier`, `email_verified_at`, `role_id`, `created_at`, `updated_at`) VALUES
('usr-support-admin-01', 'admin@hambaktech.com.ng', '+2348000000002', 'pbkdf2$100000$66d14786f83f264742cd09f8545b1e67$cc00489f3ba99943f0d4909cfb5834cb360e4e780da39b3b8349ffefc5cdf8a21ad1536c6ef141c3cccee9bf52ecafae2f38858e5bd2a2e0d24e33aeb91292bb', 'ACTIVE', 'CORPORATE', NOW(), 'role-support-admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE `status`='ACTIVE', `role_id`='role-support-admin', `password_hash`='pbkdf2$100000$66d14786f83f264742cd09f8545b1e67$cc00489f3ba99943f0d4909cfb5834cb360e4e780da39b3b8349ffefc5cdf8a21ad1536c6ef141c3cccee9bf52ecafae2f38858e5bd2a2e0d24e33aeb91292bb';

INSERT INTO `user_profiles` (`id`, `user_id`, `first_name`, `last_name`, `kyc_tier`, `kyc_status`, `created_at`, `updated_at`) VALUES
('prof-support-admin-01', 'usr-support-admin-01', 'Support', 'Admin', 'TIER_3', 'VERIFIED', NOW(), NOW())
ON DUPLICATE KEY UPDATE `first_name`='Support', `last_name`='Admin';

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `ledger_balance`, `currency`, `status`, `created_at`, `updated_at`) VALUES
('wal-support-admin-01', 'usr-support-admin-01', 250000.00, 250000.00, 'NGN', 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE `status`='ACTIVE';

SET FOREIGN_KEY_CHECKS = 1;
