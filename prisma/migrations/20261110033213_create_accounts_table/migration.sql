-- CreateTable
CREATE TABLE `accounts` (
    `id` CHAR(36) NOT NULL,
    `account_number` VARCHAR(20) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `balance` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `status` VARCHAR(20) NOT NULL,
    `version` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `uk_accounts_account_number`(`account_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `fk_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE `accounts` ADD CONSTRAINT `chk_accounts_balance_non_negative` CHECK (`balance` >= 0);
