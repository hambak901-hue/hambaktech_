-- HambakTech M7 identity + telecom integration
-- Run after the canonical database/schema.sql.

CREATE TABLE IF NOT EXISTS `identity_verifications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `reference` VARCHAR(100) NOT NULL UNIQUE,
  `provider` VARCHAR(50) NOT NULL,
  `operation` VARCHAR(60) NOT NULL,
  `amount` DECIMAL(14,2) NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `provider_reference` VARCHAR(150) NULL,
  `result_summary` LONGTEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_idv_user` (`user_id`),
  INDEX `idx_idv_provider_ref` (`provider`,`provider_reference`),
  CONSTRAINT `fk_idv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `telecom_transactions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `reference` VARCHAR(100) NOT NULL UNIQUE,
  `provider` VARCHAR(30) NOT NULL,
  `service_type` VARCHAR(30) NOT NULL,
  `request_id` VARCHAR(100) NOT NULL UNIQUE,
  `amount` DECIMAL(14,2) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'PROCESSING',
  `provider_reference` VARCHAR(150) NULL,
  `request_payload` LONGTEXT NULL,
  `response_payload` LONGTEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tel_user` (`user_id`),
  INDEX `idx_tel_provider_ref` (`provider`,`provider_reference`),
  CONSTRAINT `fk_tel_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Provider customer-price settings are intentionally absent here.
-- Configure them in Admin > Settings after reviewing provider costs and HambakTech pricing.
-- Required keys:
-- veripine_nin_verification_price
-- veripine_nin_phone_price
-- veripine_nin_tracking_price
-- veripine_nin_demography_price
-- veripine_bvn_verification_price
-- veripine_bvn_phone_price
-- veripine_nin_modification_price
