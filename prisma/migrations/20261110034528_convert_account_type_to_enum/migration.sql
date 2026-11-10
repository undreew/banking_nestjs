/*
  Warnings:

  - You are about to alter the column `type` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `accounts` MODIFY `type` ENUM('SAVINGS', 'CHECKING') NOT NULL DEFAULT 'SAVINGS';
