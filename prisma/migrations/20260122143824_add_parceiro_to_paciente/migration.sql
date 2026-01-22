-- AlterTable
ALTER TABLE `Paciente` ADD COLUMN `parceiroId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Paciente_parceiroId_idx` ON `Paciente`(`parceiroId`);

-- AddForeignKey
ALTER TABLE `Paciente` ADD CONSTRAINT `Paciente_parceiroId_fkey` FOREIGN KEY (`parceiroId`) REFERENCES `Parceiro`(`idParceiro`) ON DELETE SET NULL ON UPDATE CASCADE;
