-- =====================================================================
-- HAMBAKTECH SMART DIGITAL PLATFORM v1.0
-- Migration: 2026-10-09-permanent-root-super-admin.sql
-- Target: www.business.hambaktech.com.ng
-- Purpose: Authoritative reconciliation of permanent root Super Admin
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Ensure super_admin role exists with full system attributes
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES
('role-super-admin', 'Super Administrator', 'super_admin', 'Full platform access, operational governance, and financial configuration', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`='Super Administrator', `slug`='super_admin', `is_system`=1;

-- 2. Permanent Root Super Admin: admin@hambaktech.com.ng
INSERT INTO `users` (`id`, `email`, `phone`, `password_hash`, `status`, `customer_tier`, `email_verified_at`, `role_id`, `created_at`, `updated_at`) VALUES
('usr-super-admin-01', 'admin@hambaktech.com.ng', '+2348000000002', 'pbkdf2$100000$66d14786f83f264742cd09f8545b1e67$cc00489f3ba99943f0d4909cfb5834cb360e4e780da39b3b8349ffefc5cdf8a21ad1536c6ef141c3cccee9bf52ecafae2f38858e5bd2a2e0d24e33aeb91292bb', 'ACTIVE', 'CORPORATE', NOW(), 'role-super-admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE `status`='ACTIVE', `role_id`='role-super-admin';

INSERT INTO `user_profiles` (`id`, `user_id`, `first_name`, `last_name`, `kyc_tier`, `kyc_status`, `created_at`, `updated_at`) VALUES
('prof-super-admin-01', 'usr-super-admin-01', 'Permanent Root', 'SuperAdmin', 'TIER_3', 'VERIFIED', NOW(), NOW())
ON DUPLICATE KEY UPDATE `first_name`='Permanent Root', `last_name`='SuperAdmin';

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `ledger_balance`, `currency`, `status`, `created_at`, `updated_at`) VALUES
('wal-super-admin-01', 'usr-super-admin-01', 1000000.00, 1000000.00, 'NGN', 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE `status`='ACTIVE';

-- 3. Dedicated Support Admin: support@hambaktech.com.ng
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES
('role-support-admin', 'Support Administrator', 'support_admin', 'Customer support, order status inspection, inquiry management, and academy review', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`='Support Administrator', `slug`='support_admin', `is_system`=1;

INSERT INTO `users` (`id`, `email`, `phone`, `password_hash`, `status`, `customer_tier`, `email_verified_at`, `role_id`, `created_at`, `updated_at`) VALUES
('usr-support-admin-01', 'support@hambaktech.com.ng', '+2348000000008', 'pbkdf2$100000$66d14786f83f264742cd09f8545b1e67$cc00489f3ba99943f0d4909cfb5834cb360e4e780da39b3b8349ffefc5cdf8a21ad1536c6ef141c3cccee9bf52ecafae2f38858e5bd2a2e0d24e33aeb91292bb', 'ACTIVE', 'CORPORATE', NOW(), 'role-support-admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE `status`='ACTIVE', `role_id`='role-support-admin';

INSERT INTO `user_profiles` (`id`, `user_id`, `first_name`, `last_name`, `kyc_tier`, `kyc_status`, `created_at`, `updated_at`) VALUES
('prof-support-admin-01', 'usr-support-admin-01', 'Support', 'Admin', 'TIER_3', 'VERIFIED', NOW(), NOW())
ON DUPLICATE KEY UPDATE `first_name`='Support', `last_name`='Admin';

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `ledger_balance`, `currency`, `status`, `created_at`, `updated_at`) VALUES
('wal-support-admin-01', 'usr-support-admin-01', 250000.00, 250000.00, 'NGN', 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE `status`='ACTIVE';

SET FOREIGN_KEY_CHECKS = 1;
