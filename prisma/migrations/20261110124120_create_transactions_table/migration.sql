-- CreateTable
CREATE TABLE `transactions` (
    `id` CHAR(36) NOT NULL,
    `source_account_id` CHAR(36) NULL,
    `destination_account_id` CHAR(36) NULL,
    `type` VARCHAR(20) NOT NULL,
    `amount` DECIMAL(19, 4) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `idempotency_key` VARCHAR(100) NULL,
    `reversal_of_transaction_id` CHAR(36) NULL,
    `description` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_transactions_idempotency_key`(`idempotency_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `fk_transactions_source_account` FOREIGN KEY (`source_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `fk_transactions_destination_account` FOREIGN KEY (`destination_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `fk_transactions_reversal_of` FOREIGN KEY (`reversal_of_transaction_id`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE `transactions` ADD CONSTRAINT `chk_transactions_amount_positive` CHECK (`amount` > 0);
