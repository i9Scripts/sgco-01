/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Profissional` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Paciente` ADD COLUMN `nFicha` INTEGER NULL;

-- AlterTable
ALTER TABLE `Profissional` ADD COLUMN `userId` INTEGER NULL,
    MODIFY `nome` VARCHAR(60) NULL,
    MODIFY `celular` VARCHAR(15) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Profissional_userId_key` ON `Profissional`(`userId`);

-- CreateIndex
CREATE INDEX `Profissional_userId_idx` ON `Profissional`(`userId`);

-- AddForeignKey
ALTER TABLE `Profissional` ADD CONSTRAINT `Profissional_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`idUser`) ON DELETE SET NULL ON UPDATE CASCADE;
