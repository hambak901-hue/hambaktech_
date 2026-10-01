-- =====================================================================
-- HAMBAKTECH SMART DIGITAL PLATFORM v1.0 — DEVELOPMENT SEED DATA
-- Strictly for Local Development / Sandbox Testing Environments
-- DO NOT RUN IN PRODUCTION
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Development Test Users
-- Standard test password: Password123!
-- PBKDF2-HMAC-SHA512: 100,000 iterations, 32-byte salt
INSERT INTO `users` (`id`, `email`, `phone`, `password_hash`, `status`, `customer_tier`, `email_verified_at`, `role_id`, `created_at`, `updated_at`) VALUES
('usr-adm-001', 'admin@hambaktech.com.ng', '08030000001', 'pbkdf2_sha512$100000$c62e55d5bb2bb98950868f0814a0ad2b99211c4710ca8b209d7df9d9deec20f2$e82b794273dfba8a452ef3226db2d713c23315a6bfa9fec15865e933486c997a44fbc752df8566f1d8c83a79d9841d7d0285a97aa32d603a11b697666249e0a0', 'ACTIVE', 'STANDARD', NOW(), 'role-super-admin', NOW(), NOW()),
('usr-cust-001', 'customer@hambaktech.com.ng', '08147837664', 'pbkdf2_sha512$100000$c62e55d5bb2bb98950868f0814a0ad2b99211c4710ca8b209d7df9d9deec20f2$e82b794273dfba8a452ef3226db2d713c23315a6bfa9fec15865e933486c997a44fbc752df8566f1d8c83a79d9841d7d0285a97aa32d603a11b697666249e0a0', 'ACTIVE', 'STANDARD', NOW(), 'role-customer', NOW(), NOW()),
('usr-stud-001', 'student@hambaktech.com.ng', '08030000002', 'pbkdf2_sha512$100000$c62e55d5bb2bb98950868f0814a0ad2b99211c4710ca8b209d7df9d9deec20f2$e82b794273dfba8a452ef3226db2d713c23315a6bfa9fec15865e933486c997a44fbc752df8566f1d8c83a79d9841d7d0285a97aa32d603a11b697666249e0a0', 'ACTIVE', 'STANDARD', NOW(), 'role-student', NOW(), NOW())
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`);

-- 2. Development Test Profiles
INSERT INTO `user_profiles` (`id`, `user_id`, `first_name`, `last_name`, `state`, `lga`, `kyc_tier`, `kyc_status`) VALUES
('prof-adm-001', 'usr-adm-001', 'Hammed', 'Bakare', 'Lagos State', 'Ibeju-Lekki', 'TIER_3', 'VERIFIED'),
('prof-cust-001', 'usr-cust-001', 'Demo', 'Customer', 'Lagos State', 'Ibeju-Lekki', 'TIER_2', 'VERIFIED'),
('prof-stud-001', 'usr-stud-001', 'Demo', 'Student', 'Lagos State', 'Ibeju-Lekki', 'TIER_1', 'VERIFIED')
ON DUPLICATE KEY UPDATE `first_name`=VALUES(`first_name`);

-- 3. Development Test Wallets (Isolated test funds)
INSERT INTO `wallets` (`id`, `user_id`, `balance`, `ledger_balance`, `currency`, `status`) VALUES
('wal-adm-001', 'usr-adm-001', 50000.00, 50000.00, 'NGN', 'ACTIVE'),
('wal-cust-001', 'usr-cust-001', 10000.00, 10000.00, 'NGN', 'ACTIVE'),
('wal-stud-001', 'usr-stud-001', 5000.00, 5000.00, 'NGN', 'ACTIVE')
ON DUPLICATE KEY UPDATE `balance`=VALUES(`balance`);

SET FOREIGN_KEY_CHECKS = 1;
