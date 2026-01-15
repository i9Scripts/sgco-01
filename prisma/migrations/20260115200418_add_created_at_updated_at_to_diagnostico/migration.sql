/*
  Warnings:

  - Added the required column `updatedAt` to the `Diagnostico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Diagnostico` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `descricao` VARCHAR(255) NOT NULL;
