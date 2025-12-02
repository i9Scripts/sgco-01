/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `email_verified_at` TIMESTAMP(0) NULL,
    ADD COLUMN `remember_token` VARCHAR(100) NULL;

-- DropTable
DROP TABLE `users`;
