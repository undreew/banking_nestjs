/*
  Warnings:

  - You are about to alter the column `status` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `accounts` MODIFY `status` ENUM('ACTIVE', 'FROZEN', 'CLOSED') NOT NULL DEFAULT 'ACTIVE';
