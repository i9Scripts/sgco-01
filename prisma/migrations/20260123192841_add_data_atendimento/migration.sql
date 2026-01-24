-- AlterTable
ALTER TABLE `Paciente` ADD COLUMN `dataAtend` VARCHAR(10) NULL;

-- CreateIndex
CREATE INDEX `Paciente_dataAtend_idx` ON `Paciente`(`dataAtend`);
