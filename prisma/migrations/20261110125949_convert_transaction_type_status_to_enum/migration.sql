/*
  Warnings:

  - You are about to alter the column `type` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(3))`.
  - You are about to alter the column `status` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `transactions` MODIFY `type` ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER') NOT NULL,
    MODIFY `status` ENUM('COMPLETED', 'REVERSED') NOT NULL DEFAULT 'COMPLETED';
