-- AlterTable
ALTER TABLE `Anamnese` MODIFY `eixoOD` VARCHAR(4) NULL,
    MODIFY `eixoOE` VARCHAR(4) NULL;

-- AlterTable
ALTER TABLE `Diagnostico` MODIFY `eixoOD` VARCHAR(4) NOT NULL,
    MODIFY `eixoOE` VARCHAR(4) NOT NULL;
