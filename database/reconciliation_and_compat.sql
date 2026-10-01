-- =====================================================================
-- HAMBAKTECH SMART DIGITAL PLATFORM v1.0
-- CANONICAL RECONCILIATION & COMPATIBILITY MIGRATION SCRIPT
-- Target: MySQL 8.0+ / MariaDB 10.4+ (Truehost cPanel Production)
--
-- STRICT ARCHITECTURAL DIRECTIVES:
-- 1. NO DROP TABLE — Never drop, reset, or truncate existing data.
-- 2. ZERO DATA LOSS — Preserves all existing customers, balances, orders.
-- 3. 100% CANONICAL SCHEMA PARITY — Creates all 39 tables matching database/schema.sql.
-- 4. SAFE DYNAMIC RECONCILIATION — Safely bridges legacy PascalCase and snake_case.
-- 5. IDEMPOTENT EXECUTION — Safe to execute repeatedly without duplicates.
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+01:00";

-- =====================================================================
-- SECTION 1: CREATE ALL 39 CANONICAL TABLES (IF NOT EXISTS)
-- Exactly matching database/schema.sql types, keys, and constraints.
-- =====================================================================

-- 1. RBAC & Identity Management
CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `is_system` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_roles_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_permissions_module` (`module`),
  INDEX `idx_permissions_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` VARCHAR(36) NOT NULL,
  `role_id` VARCHAR(36) NOT NULL,
  `permission_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
  INDEX `idx_rp_role` (`role_id`),
  INDEX `idx_rp_permission` (`permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'ACTIVE',
  `customer_tier` ENUM('STANDARD', 'AGENT', 'CORPORATE') NOT NULL DEFAULT 'STANDARD',
  `email_verified_at` DATETIME NULL,
  `phone_verified_at` DATETIME NULL,
  `role_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role_id`),
  INDEX `idx_users_status` (`status`),
  INDEX `idx_users_customer_tier` (`customer_tier`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL UNIQUE,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `address` TEXT NULL,
  `state` VARCHAR(100) NULL DEFAULT 'Lagos State',
  `lga` VARCHAR(100) NULL DEFAULT 'Ibeju-Lekki',
  `bvn_last4` VARCHAR(4) NULL,
  `nin_last4` VARCHAR(4) NULL,
  `kyc_tier` ENUM('TIER_0', 'TIER_1', 'TIER_2', 'TIER_3') NOT NULL DEFAULT 'TIER_0',
  `kyc_status` ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL UNIQUE,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `expires_at` DATETIME NOT NULL,
  `is_revoked` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sessions_user` (`user_id`),
  INDEX `idx_sessions_token` (`token_hash`),
  INDEX `idx_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `verification_tokens` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL UNIQUE,
  `type` ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION') NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `used_at` DATETIME NULL,
  `metadata` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_verif_user_type` (`user_id`, `type`),
  INDEX `idx_verif_token` (`token_hash`),
  CONSTRAINT `fk_verif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Digital Wallets & Immutable Financial Ledger
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL UNIQUE,
  `balance` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `ledger_balance` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'NGN',
  `status` ENUM('ACTIVE', 'FROZEN', 'RESTRICTED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_wallets_user` (`user_id`),
  INDEX `idx_wallets_status` (`status`),
  CONSTRAINT `fk_wallet_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wallet_ledger` (
  `id` VARCHAR(36) NOT NULL,
  `wallet_id` VARCHAR(36) NOT NULL,
  `transaction_id` VARCHAR(36) NULL,
  `type` ENUM('CREDIT', 'DEBIT') NOT NULL,
  `amount` DECIMAL(14,2) NOT NULL,
  `balance_before` DECIMAL(14,2) NOT NULL,
  `balance_after` DECIMAL(14,2) NOT NULL,
  `reference` VARCHAR(100) NOT NULL UNIQUE,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ledger_wallet` (`wallet_id`),
  INDEX `idx_ledger_ref` (`reference`),
  INDEX `idx_ledger_created` (`created_at`),
  CONSTRAINT `fk_ledger_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `reference` VARCHAR(100) NOT NULL UNIQUE,
  `type` ENUM('WALLET_FUNDING', 'SERVICE_PAYMENT', 'PRODUCT_PURCHASE', 'ACADEMY_ENROLLMENT', 'BILL_PAYMENT', 'REFUND') NOT NULL,
  `amount` DECIMAL(14,2) NOT NULL,
  `fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(14,2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'NGN',
  `status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED', 'REVERSED') NOT NULL DEFAULT 'PENDING',
  `channel` VARCHAR(50) NOT NULL DEFAULT 'WALLET',
  `metadata` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_trans_user` (`user_id`),
  INDEX `idx_trans_ref` (`reference`),
  INDEX `idx_trans_status` (`status`),
  INDEX `idx_trans_created` (`created_at`),
  CONSTRAINT `fk_trans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `transaction_id` VARCHAR(36) NULL,
  `provider` VARCHAR(50) NOT NULL,
  `provider_reference` VARCHAR(100) NULL,
  `reference` VARCHAR(100) NOT NULL UNIQUE,
  `amount` DECIMAL(14,2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'NGN',
  `status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED', 'ABANDONED') NOT NULL DEFAULT 'PENDING',
  `paid_at` DATETIME NULL,
  `raw_response` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_payments_ref` (`reference`),
  INDEX `idx_payments_provider_ref` (`provider_reference`),
  INDEX `idx_payments_user` (`user_id`),
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_payments_trans` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment_idempotency` (
  `id` VARCHAR(36) NOT NULL,
  `idempotency_key` VARCHAR(100) NOT NULL UNIQUE,
  `resource_id` VARCHAR(36) NOT NULL,
  `resource_type` VARCHAR(50) NOT NULL,
  `status_code` INT NOT NULL DEFAULT 200,
  `response_body` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_idempotency_key` (`idempotency_key`),
  INDEX `idx_idempotency_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment_webhooks` (
  `id` VARCHAR(36) NOT NULL,
  `provider` VARCHAR(50) NOT NULL,
  `event_id` VARCHAR(100) NULL,
  `event_type` VARCHAR(100) NOT NULL,
  `reference` VARCHAR(100) NULL,
  `signature` TEXT NULL,
  `payload` TEXT NOT NULL,
  `processed` TINYINT(1) NOT NULL DEFAULT 0,
  `processed_at` DATETIME NULL,
  `error_message` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_webhook_provider_event` (`provider`, `event_id`),
  INDEX `idx_webhook_reference` (`reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Service Catalog, Offerings & Pricing Rules
CREATE TABLE IF NOT EXISTS `service_categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `service_offerings` (
  `id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `base_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `agent_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `corporate_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `requires_file` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_offerings_cat` (`category_id`),
  CONSTRAINT `fk_offerings_cat` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `price_rules` (
  `id` VARCHAR(36) NOT NULL,
  `service_code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `tier` ENUM('STANDARD', 'AGENT', 'CORPORATE') NOT NULL DEFAULT 'STANDARD',
  `price` DECIMAL(10,2) NOT NULL,
  `min_quantity` INT NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pricerules_service_tier` (`service_code`, `tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `providers` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `service_type` VARCHAR(50) NOT NULL,
  `api_url` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `balance` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Orders, Order Items & Lifecycle Status Timeline
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(36) NOT NULL,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` VARCHAR(36) NOT NULL,
  `service_code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `total_amount` DECIMAL(14,2) NOT NULL,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('PENDING', 'PROCESSING', 'ACTION_REQUIRED', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `payment_status` ENUM('UNPAID', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'WALLET',
  `transaction_id` VARCHAR(36) NULL,
  `metadata` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_number` (`order_number`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` VARCHAR(36) NOT NULL,
  `order_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `subtotal` DECIMAL(14,2) NOT NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_orderitems_order` (`order_id`),
  CONSTRAINT `fk_orderitems_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_timeline` (
  `id` VARCHAR(36) NOT NULL,
  `order_id` VARCHAR(36) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `note` TEXT NULL,
  `actor_id` VARCHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_timeline_order` (`order_id`),
  CONSTRAINT `fk_timeline_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Support Tickets, Messages & Public Contact Inquiries
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` VARCHAR(36) NOT NULL,
  `ticket_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` VARCHAR(36) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'TECHNICAL',
  `subject` VARCHAR(255) NOT NULL,
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  `assigned_to_id` VARCHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tickets_number` (`ticket_number`),
  INDEX `idx_tickets_user` (`user_id`),
  INDEX `idx_tickets_status` (`status`),
  CONSTRAINT `fk_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ticket_messages` (
  `id` VARCHAR(36) NOT NULL,
  `ticket_id` VARCHAR(36) NOT NULL,
  `sender_id` VARCHAR(36) NOT NULL,
  `sender_name` VARCHAR(100) NOT NULL,
  `sender_role` VARCHAR(50) NOT NULL DEFAULT 'customer',
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ticketmsg_ticket` (`ticket_id`),
  CONSTRAINT `fk_ticketmsg_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_inquiries` (
  `id` VARCHAR(36) NOT NULL,
  `reference_number` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `service` VARCHAR(100) NOT NULL DEFAULT 'general',
  `message` TEXT NOT NULL,
  `status` ENUM('PENDING', 'ACKNOWLEDGED', 'REPLIED', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
  `ip_address` VARCHAR(45) NULL,
  `admin_notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_inquiries_ref` (`reference_number`),
  INDEX `idx_inquiries_email` (`email`),
  INDEX `idx_inquiries_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Academy & Computer Training Institute
CREATE TABLE IF NOT EXISTS `academy_courses` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL') NOT NULL DEFAULT 'BEGINNER',
  `category` VARCHAR(100) NOT NULL,
  `duration_weeks` INT NOT NULL DEFAULT 8,
  `tuition_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `instructor_name` VARCHAR(100) NOT NULL DEFAULT 'Engr. Hammed Bakare',
  `description` TEXT NOT NULL,
  `syllabus` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `course_lessons` (
  `id` VARCHAR(36) NOT NULL,
  `course_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `module_number` INT NOT NULL DEFAULT 1,
  `lesson_number` INT NOT NULL DEFAULT 1,
  `content` TEXT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 60,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_lessons_course` (`course_id`),
  CONSTRAINT `fk_lessons_course` FOREIGN KEY (`course_id`) REFERENCES `academy_courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `course_enrollments` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `course_id` VARCHAR(36) NOT NULL,
  `student_reg_number` VARCHAR(50) NOT NULL UNIQUE,
  `status` ENUM('ACTIVE', 'COMPLETED', 'DEFERRED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `progress_percent` INT NOT NULL DEFAULT 0,
  `payment_status` ENUM('PAID', 'PARTIAL', 'UNPAID') NOT NULL DEFAULT 'PAID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course` (`user_id`, `course_id`),
  INDEX `idx_enrollments_student` (`student_reg_number`),
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `academy_courses` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `certificates` (
  `id` VARCHAR(36) NOT NULL,
  `certificate_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` VARCHAR(36) NOT NULL,
  `course_id` VARCHAR(36) NOT NULL,
  `recipient_name` VARCHAR(150) NOT NULL,
  `grade` VARCHAR(20) NOT NULL DEFAULT 'Distinction',
  `issue_date` DATE NOT NULL,
  `verification_url` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_certs_number` (`certificate_number`),
  CONSTRAINT `fk_certs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_certs_course` FOREIGN KEY (`course_id`) REFERENCES `academy_courses` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `student_id_cards` (
  `id` VARCHAR(36) NOT NULL,
  `card_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` VARCHAR(36) NOT NULL,
  `course_name` VARCHAR(150) NOT NULL,
  `photo_url` VARCHAR(500) NULL,
  `qr_code_data` TEXT NOT NULL,
  `issue_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_idcards_number` (`card_number`),
  CONSTRAINT `fk_idcards_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Shop & Stationery Store
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `icon` VARCHAR(50) NULL DEFAULT 'Package',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `low_stock_threshold` INT NOT NULL DEFAULT 5,
  `image_url` VARCHAR(500) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_products_cat` (`category_id`),
  CONSTRAINT `fk_products_cat` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `delivery_zones` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `lga` VARCHAR(100) NOT NULL DEFAULT 'Ibeju-Lekki',
  `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 1500.00,
  `estimated_hours` INT NOT NULL DEFAULT 24,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Government Identity Operations (NIN & CAC)
CREATE TABLE IF NOT EXISTS `nin_requests` (
  `id` VARCHAR(36) NOT NULL,
  `reference` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` VARCHAR(36) NOT NULL,
  `nin_number` VARCHAR(11) NULL,
  `tracking_id` VARCHAR(50) NULL,
  `service_type` VARCHAR(50) NOT NULL,
  `status` ENUM('PENDING', 'PROCESSING', 'VERIFIED', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_nin_ref` (`reference`),
  INDEX `idx_nin_user` (`user_id`),
  CONSTRAINT `fk_nin_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cac_requests` (
  `id` VARCHAR(36) NOT NULL,
  `reference` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` VARCHAR(36) NOT NULL,
  `proposed_name1` VARCHAR(200) NOT NULL,
  `proposed_name2` VARCHAR(200) NULL,
  `business_type` VARCHAR(100) NOT NULL,
  `status` ENUM('SUBMITTED', 'NAME_RESERVED', 'DOCUMENTATION', 'INCORPORATED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
  `availability_code` VARCHAR(50) NULL,
  `rc_bn_number` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cac_ref` (`reference`),
  INDEX `idx_cac_user` (`user_id`),
  CONSTRAINT `fk_cac_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Notifications, Auditing & System Config
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('TRANSACTION', 'ORDER', 'SECURITY', 'ANNOUNCEMENT', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `link` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user` (`user_id`),
  INDEX `idx_notif_read` (`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NULL,
  `actor_name` VARCHAR(100) NOT NULL DEFAULT 'System',
  `actor_email` VARCHAR(255) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity` VARCHAR(100) NOT NULL,
  `entity_id` VARCHAR(50) NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `details` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_entity` (`entity`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_settings` (
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. CMS Publishing (Announcements, Pages, Blog Posts)
CREATE TABLE IF NOT EXISTS `cms_announcements` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `category` ENUM('PROMOTION', 'SYSTEM', 'ACADEMY', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_pages` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `meta_description` TEXT NULL,
  `published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_blog_posts` (
  `id` VARCHAR(36) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NULL,
  `category` VARCHAR(100) NOT NULL,
  `author` VARCHAR(100) NOT NULL,
  `published_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SECTION 2: SEED BASELINE ROLES & PERMISSIONS
-- Required so foreign keys (fk_users_role) resolve correctly.
-- =====================================================================

INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES
('role-super-admin', 'Super Administrator', 'super_admin', 'Full platform access and financial configuration', 1, NOW(), NOW()),
('role-admin', 'Platform Administrator', 'admin', 'Operations, user management, order processing', 1, NOW(), NOW()),
('role-staff', 'Operational Staff', 'staff', 'Order fulfilment, student management, counter services', 1, NOW(), NOW()),
('role-agent', 'Business Agent / Reseller', 'agent', 'Wholesale pricing, VTU bulk resale, CAC desk partner', 1, NOW(), NOW()),
('role-customer', 'Retail Customer', 'customer', 'Standard retail services, personal wallet, order tracking', 1, NOW(), NOW()),
('role-student', 'Academy Student', 'student', 'Course enrollment, assignments, student ID, certificates', 1, NOW(), NOW()),
('role-corporate', 'Corporate Client', 'corporate', 'Post-incorporation retainers, custom graphics, bulk orders', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `permissions` (`id`, `name`, `slug`, `module`, `description`) VALUES
('p-user-read', 'Read Users', 'users.read', 'users', 'View user profiles and accounts'),
('p-user-write', 'Manage Users', 'users.update', 'users', 'Create and modify user profiles'),
('p-wallet-read', 'Read Wallet', 'wallet.read', 'wallet', 'View own and client balances'),
('p-wallet-adjust', 'Adjust Wallet', 'wallet.adjust', 'wallet', 'Administrative balance adjustments'),
('p-order-create', 'Create Order', 'orders.create', 'orders', 'Submit new service and shop orders'),
('p-order-update', 'Update Order', 'orders.update', 'orders', 'Process and transition order states'),
('p-services-manage', 'Manage Services', 'services.manage', 'services', 'Configure offerings and prices'),
('p-pricing-manage', 'Manage Pricing', 'pricing.manage', 'pricing', 'Update tier rates and rules'),
('p-system-settings', 'System Settings', 'system.settings', 'system', 'Configure platform and providers')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `delivery_zones` (`id`, `name`, `lga`, `delivery_fee`, `estimated_hours`, `is_active`) VALUES
('zone-eleko', 'Eleko Junction / Beach Road', 'Ibeju-Lekki', 1000.00, 4, 1),
('zone-bogije', 'Bogije / Shapati Axis', 'Ibeju-Lekki', 1500.00, 6, 1),
('zone-lakowe', 'Lakowe / Golf Course Phase', 'Ibeju-Lekki', 1800.00, 6, 1),
('zone-awoyaya', 'Awoyaya / Mayfair Gardens', 'Ibeju-Lekki', 2000.00, 8, 1),
('zone-epe', 'Epe Town / T-Junction', 'Epe', 3500.00, 24, 1),
('zone-ajah', 'Ajah / Sangotedo / Jubilee Bridge', 'Eti-Osa', 3000.00, 24, 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `system_settings` (`key`, `value`, `description`) VALUES
('app_name', 'HambakTech Smart Digital Platform', 'Public platform name'),
('company_email', 'support@hambaktech.com.ng', 'Primary support and notification email'),
('company_phone', '08147837664', 'Customer care phone line'),
('physical_address', 'Suite 4, Eleko Junction Commercial Plaza, Ibeju-Lekki, Lagos', 'Office address'),
('currency', 'NGN', 'Platform base currency'),
('otp_expiry_minutes', '15', 'Time window for password reset OTP'),
('rate_limit_per_minute', '60', 'Standard API rate limit per client IP')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);

-- =====================================================================
-- SECTION 3: SAFE NON-DESTRUCTIVE DATA SYNCHRONIZATION FROM LEGACY TABLES
-- Dynamically checks table and column existence before copying.
-- Never overwrites or drops source data.
-- =====================================================================

-- 3.1 Synchronize Roles from legacy Role if exists
SET @has_legacy_role = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Role');
SET @sql_sync_roles = IF(@has_legacy_role > 0,
  'INSERT IGNORE INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`)
   SELECT `id`, `name`, `slug`, `description`, IFNULL(`isSystem`, 0), `createdAt`, `updatedAt` FROM `Role`',
  'DO 0'
);
PREPARE stmt FROM @sql_sync_roles; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.2 Synchronize Users from legacy User table
SET @has_legacy_user = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'User');
SET @user_has_deleted_at = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'User' AND column_name = 'deletedAt');
SET @user_status_expr = IF(@user_has_deleted_at > 0, "CASE WHEN `deletedAt` IS NOT NULL THEN 'INACTIVE' ELSE IFNULL(`status`, 'ACTIVE') END", "IFNULL(`status`, 'ACTIVE')");

SET @sql_sync_users = IF(@has_legacy_user > 0,
  CONCAT(
    'INSERT IGNORE INTO `users` (`id`, `email`, `phone`, `password_hash`, `status`, `customer_tier`, `email_verified_at`, `phone_verified_at`, `role_id`, `created_at`, `updated_at`) ',
    'SELECT u.`id`, u.`email`, u.`phone`, u.`passwordHash`, ', @user_status_expr, ', ',
    'IFNULL(u.`customerTier`, "STANDARD"), u.`emailVerifiedAt`, u.`phoneVerifiedAt`, ',
    'IFNULL(r.`id`, "role-customer"), u.`createdAt`, u.`updatedAt` ',
    'FROM `User` u ',
    'LEFT JOIN `roles` r ON u.`roleId` = r.`id`'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_users; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.3 Synchronize Profiles from legacy UserProfile / CustomerProfile
SET @has_legacy_profile = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('UserProfile', 'CustomerProfile') LIMIT 1);
SET @legacy_profile_table = IF(@has_legacy_profile > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('UserProfile', 'CustomerProfile') LIMIT 1), 'UserProfile');

SET @sql_sync_profiles = IF(@has_legacy_profile > 0,
  CONCAT(
    'INSERT IGNORE INTO `user_profiles` (`id`, `user_id`, `first_name`, `last_name`, `avatar_url`, `address`, `state`, `lga`, `bvn_last4`, `nin_last4`, `kyc_tier`, `kyc_status`, `created_at`, `updated_at`) ',
    'SELECT p.`id`, p.`userId`, ',
    'IFNULL(NULLIF(TRIM(p.`firstName`), ""), "Customer"), ',
    'IFNULL(NULLIF(TRIM(p.`lastName`), ""), "User"), ',
    'p.`avatarUrl`, p.`address`, ',
    'IFNULL(p.`state`, "Lagos State"), IFNULL(p.`lga`, "Ibeju-Lekki"), ',
    'NULL, NULL, ',
    'CASE WHEN p.`kycTier` IN ("TIER_0","TIER_1","TIER_2","TIER_3") THEN p.`kycTier` ELSE "TIER_0" END, ',
    'CASE WHEN p.`kycStatus` = "VERIFIED" OR IFNULL(p.`ninVerified`, 0) = 1 OR IFNULL(p.`bvnVerified`, 0) = 1 THEN "VERIFIED" WHEN p.`kycStatus` = "PENDING" THEN "PENDING" ELSE "UNVERIFIED" END, ',
    'p.`createdAt`, p.`updatedAt` ',
    'FROM `', @legacy_profile_table, '` p ',
    'WHERE p.`userId` IN (SELECT `id` FROM `users`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_profiles; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.4 Synchronize Wallets from legacy Wallet
-- Detects currentBalance vs balance column safely
SET @has_legacy_wallet = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Wallet');
SET @wallet_bal_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'Wallet' AND column_name = 'currentBalance') > 0, 'currentBalance', 'balance');
SET @wallet_ledger_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'Wallet' AND column_name = 'ledgerBalance') > 0, '`ledgerBalance`', @wallet_bal_col);

SET @sql_sync_wallets = IF(@has_legacy_wallet > 0,
  CONCAT(
    'INSERT IGNORE INTO `wallets` (`id`, `user_id`, `balance`, `ledger_balance`, `currency`, `status`, `created_at`, `updated_at`) ',
    'SELECT w.`id`, w.`userId`, IFNULL(w.`', @wallet_bal_col, '`, 0.00), IFNULL(', @wallet_ledger_col, ', 0.00), ',
    'IFNULL(w.`currency`, "NGN"), ',
    'CASE WHEN w.`status` = "FROZEN" THEN "FROZEN" WHEN w.`status` = "SUSPENDED" THEN "RESTRICTED" ELSE "ACTIVE" END, ',
    'w.`createdAt`, w.`updatedAt` ',
    'FROM `Wallet` w ',
    'WHERE w.`userId` IN (SELECT `id` FROM `users`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_wallets; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.5 Synchronize Wallet Ledger Entries from legacy WalletLedgerEntry
SET @has_legacy_ledger = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('WalletLedgerEntry', 'wallet_ledger_entries') LIMIT 1);
SET @legacy_ledger_table = IF(@has_legacy_ledger > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('WalletLedgerEntry', 'wallet_ledger_entries') LIMIT 1), 'WalletLedgerEntry');

SET @sql_sync_ledger = IF(@has_legacy_ledger > 0,
  CONCAT(
    'INSERT IGNORE INTO `wallet_ledger` (`id`, `wallet_id`, `transaction_id`, `type`, `amount`, `balance_before`, `balance_after`, `reference`, `category`, `description`, `created_at`) ',
    'SELECT le.`id`, le.`walletId`, NULL, ',
    'CASE WHEN le.`entryType` = "CREDIT" THEN "CREDIT" ELSE "DEBIT" END, ',
    'le.`amount`, le.`balanceBefore`, le.`balanceAfter`, ',
    'CONCAT("WLE-", le.`id`), ',
    'IFNULL(le.`referenceType`, "SERVICE_PAYMENT"), ',
    'IFNULL(le.`description`, "Legacy financial transaction"), ',
    'le.`createdAt` ',
    'FROM `', @legacy_ledger_table, '` le ',
    'WHERE le.`walletId` IN (SELECT `id` FROM `wallets`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_ledger; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.6 Synchronize Transactions from legacy Transaction
SET @has_legacy_txn = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Transaction');

SET @sql_sync_txn = IF(@has_legacy_txn > 0,
  'INSERT IGNORE INTO `transactions` (`id`, `user_id`, `reference`, `type`, `amount`, `fee`, `total_amount`, `currency`, `status`, `channel`, `metadata`, `created_at`, `updated_at`)
   SELECT t.`id`, t.`userId`, t.`reference`,
   CASE WHEN t.`type` IN ("WALLET_FUNDING","SERVICE_PAYMENT","PRODUCT_PURCHASE","ACADEMY_ENROLLMENT","BILL_PAYMENT","REFUND") THEN t.`type` ELSE "SERVICE_PAYMENT" END,
   t.`amount`, IFNULL(t.`fee`, 0.00), (t.`amount` + IFNULL(t.`fee`, 0.00)),
   IFNULL(t.`currency`, "NGN"),
   CASE WHEN t.`status` IN ("SUCCESSFUL","SUCCESS") THEN "SUCCESSFUL" WHEN t.`status` IN ("FAILED","DECLINED") THEN "FAILED" WHEN t.`status` IN ("REVERSED","REFUNDED") THEN "REVERSED" ELSE "PENDING" END,
   IFNULL(t.`channel`, "WALLET"),
   t.`metadata`, t.`createdAt`, t.`updatedAt`
   FROM `Transaction` t
   WHERE t.`userId` IN (SELECT `id` FROM `users`)',
  'DO 0'
);
PREPARE stmt FROM @sql_sync_txn; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.7 Synchronize Service Categories from legacy ServiceCategory
SET @has_legacy_sc = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'ServiceCategory');

SET @sql_sync_sc = IF(@has_legacy_sc > 0,
  'INSERT IGNORE INTO `service_categories` (`id`, `name`, `slug`, `code`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`)
   SELECT `id`, `name`, `slug`, `code`, `description`, IFNULL(`displayOrder`, 0), IFNULL(`isActive`, 1), `createdAt`, `updatedAt` FROM `ServiceCategory`',
  'DO 0'
);
PREPARE stmt FROM @sql_sync_sc; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Baseline service categories from seed data
INSERT INTO `service_categories` (`id`, `name`, `slug`, `code`, `description`, `sort_order`, `is_active`) VALUES
('cat-vtu', 'Telecom VTU & Utilities', 'telecom-vtu', 'VTU', 'Airtime top-up, data bundles, electricity disco tokens', 1, 1),
('cat-biz', 'Business Centre & Secretarial', 'business-centre', 'BUSINESS_CENTRE', 'Photocopying, typesetting, scanning, lamination', 2, 1),
('cat-print', 'Printing & PVC Cards', 'printing', 'PRINTING', 'Plastic NIN card prints, official staff ID cards, flyers', 3, 1),
('cat-graph', 'Graphics & Visual Design', 'graphics', 'GRAPHICS', 'Brand identity, logos, event flyers, collateral', 4, 1),
('cat-web', 'Web & Software Engineering', 'software', 'SOFTWARE', 'Responsive websites, custom portal development', 5, 1),
('cat-nin', 'NIN Identity Operations', 'nin-identity', 'NIN_ID', 'NIN verification, premium slip reprints, PVC issuance', 6, 1),
('cat-cac', 'CAC Corporate Liaison', 'cac-registration', 'CAC_REG', 'Business name reservations, corporate registration', 7, 1),
('cat-acad', 'Computer Training Academy', 'academy', 'ACADEMY', 'Vocational computer literacy, desktop publishing, web design', 8, 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 3.8 Synchronize Service Offerings from legacy Service / services
SET @has_legacy_srv = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('Service', 'services') LIMIT 1);
SET @legacy_srv_table = IF(@has_legacy_srv > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('Service', 'services') LIMIT 1), 'Service');
SET @srv_has_kobo = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_srv_table AND column_name = 'basePriceKobo');
SET @srv_price_expr = IF(@srv_has_kobo > 0, "ROUND(IFNULL(s.`basePriceKobo`, 0) / 100, 2)", "IFNULL(s.`basePrice`, 0.00)");
SET @srv_has_agent = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_srv_table AND column_name IN ('agentPrice', 'agent_price'));
SET @srv_agent_expr = IF(@srv_has_agent > 0, "IFNULL(s.`agentPrice`, s.`basePrice`)", @srv_price_expr);
SET @srv_has_corp = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_srv_table AND column_name IN ('corporatePrice', 'corporate_price'));
SET @srv_corp_expr = IF(@srv_has_corp > 0, "IFNULL(s.`corporatePrice`, s.`basePrice`)", @srv_price_expr);

SET @sql_sync_srv = IF(@has_legacy_srv > 0,
  CONCAT(
    'INSERT IGNORE INTO `service_offerings` (`id`, `category_id`, `title`, `slug`, `code`, `description`, `base_price`, `agent_price`, `corporate_price`, `is_active`, `requires_file`, `created_at`, `updated_at`) ',
    'SELECT s.`id`, s.`categoryId`, s.`name`, s.`slug`, s.`code`, s.`shortDescription`, ',
    @srv_price_expr, ', ',
    @srv_agent_expr, ', ',
    @srv_corp_expr, ', ',
    'CASE WHEN s.`status` = "ACTIVE" THEN 1 ELSE 0 END, ',
    'IFNULL(s.`requiresDocuments`, 0), ',
    's.`createdAt`, s.`updatedAt` ',
    'FROM `', @legacy_srv_table, '` s ',
    'WHERE s.`categoryId` IN (SELECT `id` FROM `service_categories`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_srv; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Baseline service offerings from seed data
INSERT INTO `service_offerings` (`id`, `category_id`, `title`, `slug`, `code`, `base_price`, `agent_price`, `corporate_price`, `is_active`) VALUES
('srv-nin-pvc', 'cat-nin', 'Plastic NIN Card Printing', 'nin-pvc-card', 'NIN_PVC', 1500.00, 1200.00, 1000.00, 1),
('srv-cac-bn', 'cat-cac', 'CAC Business Name Registration', 'cac-business-name', 'CAC_BN', 25000.00, 22000.00, 20000.00, 1),
('srv-cac-ltd', 'cat-cac', 'CAC Limited Liability Company', 'cac-ltd-company', 'CAC_LTD', 60000.00, 55000.00, 50000.00, 1),
('srv-cert-lam', 'cat-biz', 'A4 Document Lamination', 'a4-lamination', 'LAM_A4', 500.00, 400.00, 350.00, 1),
('srv-logo-des', 'cat-graph', 'Professional Corporate Logo Design', 'logo-design', 'LOGO_DSN', 15000.00, 12000.00, 10000.00, 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 3.9 Synchronize Orders from legacy Order
SET @has_legacy_order = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Order');

SET @sql_sync_orders = IF(@has_legacy_order > 0,
  'INSERT IGNORE INTO `orders` (`id`, `order_number`, `user_id`, `service_code`, `title`, `total_amount`, `discount_amount`, `status`, `payment_status`, `payment_method`, `transaction_id`, `metadata`, `created_at`, `updated_at`)
   SELECT o.`id`, o.`orderNumber`, o.`userId`,
   "GENERAL-SERVICE",
   "Digital Service Order",
   o.`totalAmount`,
   0.00,
   CASE WHEN o.`status` IN ("COMPLETED","SUCCESSFUL") THEN "COMPLETED" WHEN o.`status` = "PROCESSING" THEN "PROCESSING" WHEN o.`status` = "CANCELLED" THEN "CANCELLED" WHEN o.`status` = "REJECTED" THEN "REJECTED" WHEN o.`status` = "ACTION_REQUIRED" THEN "ACTION_REQUIRED" ELSE "PENDING" END,
   CASE WHEN o.`paymentStatus` IN ("PAID","SUCCESSFUL") THEN "PAID" WHEN o.`paymentStatus` = "REFUNDED" THEN "REFUNDED" ELSE "UNPAID" END,
   "WALLET",
   NULL,
   o.`metadata`, o.`createdAt`, o.`updatedAt`
   FROM `Order` o
   WHERE o.`userId` IN (SELECT `id` FROM `users`)',
  'DO 0'
);
PREPARE stmt FROM @sql_sync_orders; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.10 Synchronize Order Items from legacy OrderItem
SET @has_legacy_items = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('OrderItem', 'order_items') LIMIT 1);
SET @legacy_items_table = IF(@has_legacy_items > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('OrderItem', 'order_items') LIMIT 1), 'OrderItem');

SET @sql_sync_items = IF(@has_legacy_items > 0,
  CONCAT(
    'INSERT IGNORE INTO `order_items` (`id`, `order_id`, `name`, `quantity`, `unit_price`, `subtotal`, `notes`, `created_at`) ',
    'SELECT oi.`id`, oi.`orderId`, oi.`title`, IFNULL(oi.`quantity`, 1), oi.`unitPrice`, oi.`totalPrice`, oi.`metadata`, NOW() ',
    'FROM `', @legacy_items_table, '` oi ',
    'WHERE oi.`orderId` IN (SELECT `id` FROM `orders`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_items; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.11 Synchronize Order Timeline from legacy OrderStatusHistory
SET @has_legacy_timeline = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('OrderStatusHistory', 'order_status_history') LIMIT 1);
SET @legacy_timeline_table = IF(@has_legacy_timeline > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('OrderStatusHistory', 'order_status_history') LIMIT 1), 'OrderStatusHistory');

SET @sql_sync_timeline = IF(@has_legacy_timeline > 0,
  CONCAT(
    'INSERT IGNORE INTO `order_timeline` (`id`, `order_id`, `status`, `title`, `note`, `actor_id`, `created_at`) ',
    'SELECT h.`id`, h.`orderId`, h.`status`, CONCAT("Status updated to ", h.`status`), h.`note`, h.`changedById`, h.`createdAt` ',
    'FROM `', @legacy_timeline_table, '` h ',
    'WHERE h.`orderId` IN (SELECT `id` FROM `orders`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_timeline; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.12 Synchronize Academy Courses from legacy Course / courses
SET @has_legacy_course = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('Course', 'courses') LIMIT 1);
SET @legacy_course_table = IF(@has_legacy_course > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('Course', 'courses') LIMIT 1), 'Course');
SET @course_has_kobo = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_course_table AND column_name = 'tuitionFeeKobo');
SET @course_fee_expr = IF(@course_has_kobo > 0, "ROUND(IFNULL(c.`tuitionFeeKobo`, 0) / 100, 2)", "IFNULL(c.`tuitionFee`, 0.00)");

SET @sql_sync_courses = IF(@has_legacy_course > 0,
  CONCAT(
    'INSERT IGNORE INTO `academy_courses` (`id`, `title`, `slug`, `code`, `level`, `category`, `duration_weeks`, `tuition_fee`, `instructor_name`, `description`, `syllabus`, `is_active`, `created_at`, `updated_at`) ',
    'SELECT c.`id`, c.`title`, c.`slug`, c.`code`, ',
    'CASE WHEN c.`level` IN ("BEGINNER","INTERMEDIATE","ADVANCED","PROFESSIONAL") THEN c.`level` ELSE "BEGINNER" END, ',
    '"Technology & IT", ',
    'IFNULL(c.`durationWeeks`, 8), ',
    @course_fee_expr, ', ',
    '"Engr. Hammed Bakare", ',
    'IFNULL(c.`shortDescription`, c.`title`), ',
    'c.`fullDescription`, ',
    'IFNULL(c.`isActive`, 1), ',
    'c.`createdAt`, c.`updatedAt` ',
    'FROM `', @legacy_course_table, '` c'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_courses; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Baseline academy courses from seed data
INSERT INTO `academy_courses` (`id`, `title`, `slug`, `code`, `level`, `category`, `duration_weeks`, `tuition_fee`, `instructor_name`, `description`, `is_active`) VALUES
('crs-dla-01', 'Certificate in Desktop Publishing & Office Productivity', 'desktop-publishing', 'HT-ACAD-DTP', 'BEGINNER', 'Computer Literacy', 8, 35000.00, 'Engr. Hammed Bakare', 'Master Microsoft Word, Excel, PowerPoint, and professional document production.', 1),
('crs-gda-02', 'Professional Graphic Design Masterclass', 'graphic-design', 'HT-ACAD-GDA', 'INTERMEDIATE', 'Creative Design', 10, 50000.00, 'Engr. Hammed Bakare', 'Industry-standard vector graphics, typography, CorelDraw, and Adobe Suite.', 1),
('crs-wda-03', 'Full Stack Web & Software Engineering', 'web-development', 'HT-ACAD-WDA', 'ADVANCED', 'Software Engineering', 16, 95000.00, 'Engr. Hammed Bakare', 'Modern frontend with React/Next.js, backend APIs, MySQL databases, and hosting.', 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 3.13 Synchronize Course Lessons from legacy CourseModule
SET @has_legacy_modules = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('CourseModule', 'course_modules') LIMIT 1);
SET @legacy_modules_table = IF(@has_legacy_modules > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('CourseModule', 'course_modules') LIMIT 1), 'CourseModule');

SET @sql_sync_lessons = IF(@has_legacy_modules > 0,
  CONCAT(
    'INSERT IGNORE INTO `course_lessons` (`id`, `course_id`, `title`, `module_number`, `lesson_number`, `content`, `duration_minutes`, `created_at`) ',
    'SELECT m.`id`, m.`courseId`, m.`title`, IFNULL(m.`moduleOrder`, 1), 1, m.`description`, IFNULL(m.`durationHours` * 60, 60), m.`createdAt` ',
    'FROM `', @legacy_modules_table, '` m ',
    'WHERE m.`courseId` IN (SELECT `id` FROM `academy_courses`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_lessons; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.14 Synchronize Course Enrollments from legacy CourseEnrollment
SET @has_legacy_enroll = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('CourseEnrollment', 'course_enrollments') LIMIT 1);
SET @legacy_enroll_table = IF(@has_legacy_enroll > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('CourseEnrollment', 'course_enrollments') LIMIT 1), 'CourseEnrollment');

SET @sql_sync_enroll = IF(@has_legacy_enroll > 0,
  CONCAT(
    'INSERT IGNORE INTO `course_enrollments` (`id`, `user_id`, `course_id`, `student_reg_number`, `status`, `progress_percent`, `payment_status`, `created_at`, `updated_at`) ',
    'SELECT e.`id`, e.`userId`, e.`courseId`, ',
    'CONCAT("STU-", UPPER(SUBSTRING(e.`id`, 1, 8))), ',
    'CASE WHEN e.`status` IN ("ACTIVE","COMPLETED","DEFERRED","SUSPENDED") THEN e.`status` ELSE "ACTIVE" END, ',
    '0, "PAID", e.`createdAt`, e.`updatedAt` ',
    'FROM `', @legacy_enroll_table, '` e ',
    'WHERE e.`userId` IN (SELECT `id` FROM `users`) AND e.`courseId` IN (SELECT `id` FROM `academy_courses`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_enroll; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.15 Synchronize Certificates from legacy Certificate
SET @has_legacy_cert = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('Certificate', 'certificates') LIMIT 1);
SET @legacy_cert_table = IF(@has_legacy_cert > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('Certificate', 'certificates') LIMIT 1), 'Certificate');
SET @cert_has_enrollment = IF(@has_legacy_cert > 0, (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_cert_table AND column_name = 'enrollmentId'), 0);

SET @sql_sync_certs = IF(@has_legacy_cert > 0,
  IF(@cert_has_enrollment > 0,
    CONCAT(
      'INSERT IGNORE INTO `certificates` (`id`, `certificate_number`, `user_id`, `course_id`, `recipient_name`, `grade`, `issue_date`, `verification_url`, `created_at`) ',
      'SELECT c.`id`, c.`certificateNumber`, e.`userId`, e.`courseId`, IFNULL(c.`studentName`, "Student"), ',
      'IFNULL(c.`grade`, "Distinction"), DATE(IFNULL(c.`issuedAt`, c.`createdAt`)), ',
      'IFNULL(CONCAT("https://hambaktech.com.ng/verify/cert/", c.`verificationHash`), CONCAT("https://hambaktech.com.ng/verify/cert/", c.`certificateNumber`)), ',
      'c.`createdAt` ',
      'FROM `', @legacy_cert_table, '` c ',
      'JOIN `', @legacy_enroll_table, '` e ON c.`enrollmentId` = e.`id` ',
      'WHERE e.`userId` IN (SELECT `id` FROM `users`) AND e.`courseId` IN (SELECT `id` FROM `academy_courses`)'
    ),
    CONCAT(
      'INSERT IGNORE INTO `certificates` (`id`, `certificate_number`, `user_id`, `course_id`, `recipient_name`, `grade`, `issue_date`, `verification_url`, `created_at`) ',
      'SELECT c.`id`, IFNULL(c.`certificate_number`, c.`certificateNumber`), c.`user_id`, c.`course_id`, IFNULL(c.`recipient_name`, "Student"), ',
      'IFNULL(c.`grade`, "Distinction"), IFNULL(c.`issue_date`, CURDATE()), ',
      'IFNULL(c.`verification_url`, CONCAT("https://hambaktech.com.ng/verify/cert/", c.`id`)), ',
      'c.`created_at` ',
      'FROM `', @legacy_cert_table, '` c ',
      'WHERE c.`user_id` IN (SELECT `id` FROM `users`) AND c.`course_id` IN (SELECT `id` FROM `academy_courses`)'
    )
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_certs; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.16 Synchronize Government Identity NIN Requests from legacy NINRequest
SET @has_legacy_nin = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('NINRequest', 'nin_requests') LIMIT 1);
SET @legacy_nin_table = IF(@has_legacy_nin > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('NINRequest', 'nin_requests') LIMIT 1), 'NINRequest');
SET @nin_tracking_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_nin_table AND column_name = 'trackingNumber') > 0, '`trackingNumber`', '`reference`');

SET @sql_sync_nin = IF(@has_legacy_nin > 0,
  CONCAT(
    'INSERT IGNORE INTO `nin_requests` (`id`, `reference`, `user_id`, `nin_number`, `tracking_id`, `service_type`, `status`, `notes`, `created_at`, `updated_at`) ',
    'SELECT n.`id`, ', @nin_tracking_col, ', n.`userId`, NULL, ', @nin_tracking_col, ', ',
    'IFNULL(n.`serviceType`, "VERIFICATION"), ',
    'CASE WHEN n.`status` = "COMPLETED" THEN "COMPLETED" WHEN n.`status` IN ("REJECTED","QUERY","FAILED") THEN "REJECTED" WHEN n.`status` = "PROCESSING" THEN "PROCESSING" WHEN n.`status` = "VERIFIED" THEN "VERIFIED" ELSE "PENDING" END, ',
    'n.`notes`, n.`createdAt`, n.`updatedAt` ',
    'FROM `', @legacy_nin_table, '` n ',
    'WHERE n.`userId` IN (SELECT `id` FROM `users`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_nin; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.17 Synchronize Corporate CAC Requests from legacy CACRequest
SET @has_legacy_cac = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('CACRequest', 'cac_requests') LIMIT 1);
SET @legacy_cac_table = IF(@has_legacy_cac > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('CACRequest', 'cac_requests') LIMIT 1), 'CACRequest');
SET @cac_tracking_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_cac_table AND column_name = 'trackingNumber') > 0, '`trackingNumber`', '`reference`');
SET @cac_entity_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_cac_table AND column_name = 'entityType') > 0, '`entityType`', '`business_type`');
SET @cac_rc_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_cac_table AND column_name = 'rcNumber') > 0, '`rcNumber`', '`rc_bn_number`');

SET @sql_sync_cac = IF(@has_legacy_cac > 0,
  CONCAT(
    'INSERT IGNORE INTO `cac_requests` (`id`, `reference`, `user_id`, `proposed_name1`, `proposed_name2`, `business_type`, `status`, `availability_code`, `rc_bn_number`, `notes`, `created_at`, `updated_at`) ',
    'SELECT c.`id`, ', @cac_tracking_col, ', c.`userId`, c.`proposedName1`, c.`proposedName2`, ',
    'IFNULL(c.', @cac_entity_col, ', "BUSINESS_NAME"), ',
    'CASE WHEN c.`status` = "NAME_RESERVATION" THEN "NAME_RESERVED" WHEN c.`status` IN ("DOCUMENT_PREPARATION","SUBMITTED_TO_PORTAL") THEN "DOCUMENTATION" WHEN c.`status` IN ("APPROVED_CERTIFICATE_READY","COMPLETED") THEN "INCORPORATED" WHEN c.`status` = "REJECTED" THEN "REJECTED" ELSE "SUBMITTED" END, ',
    'c.`portalSubmissionRef`, c.', @cac_rc_col, ', c.`notes`, c.`createdAt`, c.`updatedAt` ',
    'FROM `', @legacy_cac_table, '` c ',
    'WHERE c.`userId` IN (SELECT `id` FROM `users`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_cac; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.18 Synchronize Support Tickets from legacy SupportTicket
SET @has_legacy_tickets = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('SupportTicket', 'support_tickets') LIMIT 1);
SET @legacy_ticket_table = IF(@has_legacy_tickets > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('SupportTicket', 'support_tickets') LIMIT 1), 'SupportTicket');

SET @sql_sync_tickets = IF(@has_legacy_tickets > 0,
  CONCAT(
    'INSERT IGNORE INTO `support_tickets` (`id`, `ticket_number`, `user_id`, `category`, `subject`, `priority`, `status`, `assigned_to_id`, `created_at`, `updated_at`) ',
    'SELECT t.`id`, t.`ticketNumber`, t.`userId`, IFNULL(t.`category`, "TECHNICAL"), t.`subject`, ',
    'IFNULL(t.`priority`, "MEDIUM"), ',
    'CASE WHEN t.`status` IN ("OPEN","IN_PROGRESS","WAITING_ON_CUSTOMER","RESOLVED","CLOSED") THEN t.`status` ELSE "OPEN" END, ',
    't.`assignedToId`, t.`createdAt`, t.`updatedAt` ',
    'FROM `', @legacy_ticket_table, '` t ',
    'WHERE t.`userId` IN (SELECT `id` FROM `users`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_tickets; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.19 Synchronize Ticket Messages from legacy TicketMessage
SET @has_legacy_messages = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('TicketMessage', 'ticket_messages') LIMIT 1);
SET @legacy_msg_table = IF(@has_legacy_messages > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('TicketMessage', 'ticket_messages') LIMIT 1), 'TicketMessage');

SET @sql_sync_messages = IF(@has_legacy_messages > 0,
  CONCAT(
    'INSERT IGNORE INTO `ticket_messages` (`id`, `ticket_id`, `sender_id`, `sender_name`, `sender_role`, `content`, `created_at`) ',
    'SELECT m.`id`, m.`ticketId`, m.`senderId`, IFNULL(m.`senderName`, "User"), IFNULL(m.`senderRole`, "customer"), m.`content`, m.`createdAt` ',
    'FROM `', @legacy_msg_table, '` m ',
    'WHERE m.`ticketId` IN (SELECT `id` FROM `support_tickets`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_messages; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.20 Synchronize User Sessions from legacy UserSession / sessions
SET @has_legacy_sessions = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('UserSession', 'user_sessions', 'sessions') LIMIT 1);
SET @legacy_session_table = IF(@has_legacy_sessions > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('UserSession', 'user_sessions', 'sessions') LIMIT 1), 'UserSession');
SET @session_user_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_session_table AND column_name = 'userId') > 0, '`userId`', '`user_id`');
SET @session_token_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_session_table AND column_name = 'tokenHash') > 0, '`tokenHash`', '`token_hash`');
SET @session_ip_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_session_table AND column_name = 'ipAddress') > 0, '`ipAddress`', '`ip_address`');
SET @session_ua_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_session_table AND column_name = 'userAgent') > 0, '`userAgent`', '`user_agent`');
SET @session_exp_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_session_table AND column_name = 'expiresAt') > 0, '`expiresAt`', '`expires_at`');
SET @session_rev_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_session_table AND column_name = 'isRevoked') > 0, '`isRevoked`', '`is_revoked`');
SET @session_created_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_session_table AND column_name = 'createdAt') > 0, '`createdAt`', '`created_at`');

SET @sql_sync_sessions = IF(@has_legacy_sessions > 0 AND @legacy_session_table != 'user_sessions',
  CONCAT(
    'INSERT IGNORE INTO `user_sessions` (`id`, `user_id`, `token_hash`, `ip_address`, `user_agent`, `expires_at`, `is_revoked`, `created_at`) ',
    'SELECT s.`id`, s.', @session_user_col, ', s.', @session_token_col, ', s.', @session_ip_col, ', s.', @session_ua_col, ', s.', @session_exp_col, ', IFNULL(s.', @session_rev_col, ', 0), s.', @session_created_col, ' ',
    'FROM `', @legacy_session_table, '` s ',
    'WHERE s.', @session_user_col, ' IN (SELECT `id` FROM `users`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_sessions; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.21 Synchronize Verification Tokens from legacy VerificationToken
SET @has_legacy_vtokens = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('VerificationToken', 'verification_tokens') LIMIT 1);
SET @legacy_vtoken_table = IF(@has_legacy_vtokens > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('VerificationToken', 'verification_tokens') LIMIT 1), 'VerificationToken');
SET @vtoken_user_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_vtoken_table AND column_name = 'userId') > 0, '`userId`', '`user_id`');
SET @vtoken_hash_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_vtoken_table AND column_name = 'tokenHash') > 0, '`tokenHash`', '`token_hash`');
SET @vtoken_exp_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_vtoken_table AND column_name = 'expiresAt') > 0, '`expiresAt`', '`expires_at`');
SET @vtoken_used_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_vtoken_table AND column_name = 'isUsed') > 0, '`isUsed`', '`is_used`');
SET @vtoken_used_at_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_vtoken_table AND column_name = 'usedAt') > 0, '`usedAt`', '`used_at`');

SET @sql_sync_vtokens = IF(@has_legacy_vtokens > 0 AND @legacy_vtoken_table != 'verification_tokens',
  CONCAT(
    'INSERT IGNORE INTO `verification_tokens` (`id`, `user_id`, `token_hash`, `type`, `expires_at`, `is_used`, `used_at`, `created_at`) ',
    'SELECT vt.`id`, vt.', @vtoken_user_col, ', vt.', @vtoken_hash_col, ', ',
    'CASE WHEN vt.`type` IN ("EMAIL_VERIFICATION","PASSWORD_RESET","PHONE_VERIFICATION") THEN vt.`type` ELSE "EMAIL_VERIFICATION" END, ',
    'vt.', @vtoken_exp_col, ', IFNULL(vt.', @vtoken_used_col, ', 0), vt.', @vtoken_used_at_col, ', vt.`createdAt` ',
    'FROM `', @legacy_vtoken_table, '` vt ',
    'WHERE vt.', @vtoken_user_col, ' IN (SELECT `id` FROM `users`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_vtokens; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.22 Synchronize Payments from legacy Payment
SET @has_legacy_payments = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('Payment', 'payments') LIMIT 1);
SET @legacy_payments_table = IF(@has_legacy_payments > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('Payment', 'payments') LIMIT 1), 'Payment');
SET @pay_user_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_payments_table AND column_name = 'userId') > 0, '`userId`', '`user_id`');
SET @pay_ref_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_payments_table AND column_name = 'paymentRef') > 0, '`paymentRef`', '`reference`');
SET @pay_prov_ref_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_payments_table AND column_name = 'providerRef') > 0, '`providerRef`', '`provider_reference`');
SET @pay_raw_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_payments_table AND column_name = 'providerResponse') > 0, '`providerResponse`', '`raw_response`');
SET @pay_paid_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_payments_table AND column_name = 'paidAt') > 0, '`paidAt`', '`paid_at`');
SET @pay_channel_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_payments_table AND column_name = 'channel') > 0, '`channel`', '"PAYSTACK"');

SET @sql_sync_payments = IF(@has_legacy_payments > 0 AND @legacy_payments_table != 'payments',
  CONCAT(
    'INSERT IGNORE INTO `payments` (`id`, `user_id`, `transaction_id`, `provider`, `provider_reference`, `reference`, `amount`, `currency`, `status`, `paid_at`, `raw_response`, `created_at`, `updated_at`) ',
    'SELECT p.`id`, p.', @pay_user_col, ', NULL, ',
    'IFNULL(p.', @pay_channel_col, ', "PAYSTACK"), p.', @pay_prov_ref_col, ', p.', @pay_ref_col, ', p.`amount`, ',
    'IFNULL(p.`currency`, "NGN"), ',
    'CASE WHEN p.`status` IN ("SUCCESSFUL","SUCCESS","PAID") THEN "SUCCESSFUL" WHEN p.`status` IN ("FAILED","DECLINED") THEN "FAILED" WHEN p.`status` = "ABANDONED" THEN "ABANDONED" ELSE "PENDING" END, ',
    'p.', @pay_paid_col, ', p.', @pay_raw_col, ', p.`createdAt`, p.`updatedAt` ',
    'FROM `', @legacy_payments_table, '` p ',
    'WHERE p.', @pay_user_col, ' IN (SELECT `id` FROM `users`)'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_payments; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.23 Synchronize Payment Webhook Events from legacy PaymentWebhookEvent
SET @has_legacy_webhooks = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('PaymentWebhookEvent', 'payment_webhooks') LIMIT 1);
SET @legacy_webhooks_table = IF(@has_legacy_webhooks > 0, (SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('PaymentWebhookEvent', 'payment_webhooks') LIMIT 1), 'PaymentWebhookEvent');
SET @wh_gateway_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_webhooks_table AND column_name = 'gateway') > 0, '`gateway`', '`provider`');
SET @wh_event_col = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @legacy_webhooks_table AND column_name = 'event') > 0, '`event`', '`event_type`');

SET @sql_sync_webhooks = IF(@has_legacy_webhooks > 0 AND @legacy_webhooks_table != 'payment_webhooks',
  CONCAT(
    'INSERT IGNORE INTO `payment_webhooks` (`id`, `provider`, `event_id`, `event_type`, `reference`, `signature`, `payload`, `processed`, `processed_at`, `error_message`, `created_at`) ',
    'SELECT w.`id`, IFNULL(w.', @wh_gateway_col, ', "PAYSTACK"), NULL, IFNULL(w.', @wh_event_col, ', "charge.success"), ',
    'NULL, NULL, IFNULL(w.`payload`, "{}"), IFNULL(w.`processed`, 0), w.`processedAt`, NULL, w.`createdAt` ',
    'FROM `', @legacy_webhooks_table, '` w'
  ),
  'DO 0'
);
PREPARE stmt FROM @sql_sync_webhooks; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Restore foreign key enforcement
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- SECTION 4: DIAGNOSTIC RECONCILIATION & INTEGRITY VERIFICATION REPORT
-- Read-only queries to confirm schema parity, row counts, and referential health.
-- =====================================================================

-- 4.1 Schema Parity Overview
SHOW TABLES;

-- 4.2 Canonical Tables Row Count Summary
SELECT
  (SELECT COUNT(*) FROM `roles`) AS count_roles,
  (SELECT COUNT(*) FROM `permissions`) AS count_permissions,
  (SELECT COUNT(*) FROM `users`) AS count_users,
  (SELECT COUNT(*) FROM `user_profiles`) AS count_user_profiles,
  (SELECT COUNT(*) FROM `wallets`) AS count_wallets,
  (SELECT COUNT(*) FROM `wallet_ledger`) AS count_wallet_ledger,
  (SELECT COUNT(*) FROM `transactions`) AS count_transactions,
  (SELECT COUNT(*) FROM `service_categories`) AS count_service_categories,
  (SELECT COUNT(*) FROM `service_offerings`) AS count_service_offerings,
  (SELECT COUNT(*) FROM `orders`) AS count_orders,
  (SELECT COUNT(*) FROM `order_items`) AS count_order_items,
  (SELECT COUNT(*) FROM `order_timeline`) AS count_order_timeline,
  (SELECT COUNT(*) FROM `academy_courses`) AS count_academy_courses,
  (SELECT COUNT(*) FROM `course_lessons`) AS count_course_lessons,
  (SELECT COUNT(*) FROM `course_enrollments`) AS count_course_enrollments,
  (SELECT COUNT(*) FROM `certificates`) AS count_certificates,
  (SELECT COUNT(*) FROM `nin_requests`) AS count_nin_requests,
  (SELECT COUNT(*) FROM `cac_requests`) AS count_cac_requests,
  (SELECT COUNT(*) FROM `support_tickets`) AS count_support_tickets,
  (SELECT COUNT(*) FROM `delivery_zones`) AS count_delivery_zones,
  (SELECT COUNT(*) FROM `system_settings`) AS count_system_settings;

-- 4.3 Financial Integrity & Balance Sanity
SELECT
  COUNT(*) AS total_wallets,
  SUM(`balance`) AS total_wallet_balance_ngn,
  SUM(`ledger_balance`) AS total_wallet_ledger_ngn,
  MIN(`balance`) AS min_wallet_balance,
  MAX(`balance`) AS max_wallet_balance
FROM `wallets`;

-- 4.4 Transaction Volume & Status Breakdown
SELECT
  `status`,
  COUNT(*) AS txn_count,
  SUM(`total_amount`) AS total_amount_ngn
FROM `transactions`
GROUP BY `status`;

-- 4.5 Referential Integrity Check (Orphans Must Be Zero)
SELECT
  (SELECT COUNT(*) FROM `wallets` WHERE `user_id` NOT IN (SELECT `id` FROM `users`)) AS orphaned_wallets,
  (SELECT COUNT(*) FROM `transactions` WHERE `user_id` NOT IN (SELECT `id` FROM `users`)) AS orphaned_transactions,
  (SELECT COUNT(*) FROM `orders` WHERE `user_id` NOT IN (SELECT `id` FROM `users`)) AS orphaned_orders,
  (SELECT COUNT(*) FROM `order_items` WHERE `order_id` NOT IN (SELECT `id` FROM `orders`)) AS orphaned_order_items,
  (SELECT COUNT(*) FROM `wallet_ledger` WHERE `wallet_id` NOT IN (SELECT `id` FROM `wallets`)) AS orphaned_ledger_entries;
