-- HambakTech M4 Migration: Authentication Tokens & Extended Roles

-- 1. Extend RoleSlug enum with manager and developer
ALTER TABLE `roles` MODIFY COLUMN `slug` ENUM('super_admin', 'admin', 'staff', 'agent', 'customer', 'student', 'manager', 'developer') NOT NULL;

-- 2. Create verification_tokens table for email verification, password reset, and phone verification
CREATE TABLE `verification_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `type` ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION') NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `usedAt` DATETIME(3) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `verification_tokens_tokenHash_key`(`tokenHash`),
    INDEX `verification_tokens_userId_type_idx`(`userId`, `type`),
    INDEX `verification_tokens_tokenHash_idx`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Add Foreign Key Constraint
ALTER TABLE `verification_tokens` ADD CONSTRAINT `verification_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
