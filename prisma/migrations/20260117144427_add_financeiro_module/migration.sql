-- AlterTable
ALTER TABLE `Parceiro` ADD COLUMN `desconto` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- CreateTable
CREATE TABLE `LancamentoFinanceiro` (
    `idLancamento` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(255) NULL,
    `valorBruto` DECIMAL(10, 2) NOT NULL,
    `valorDesconto` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `valorFinal` DECIMAL(10, 2) NOT NULL,
    `formaPagamento` ENUM('Dinheiro', 'CartaoCredito', 'CartaoDebito', 'PIX', 'Cheque', 'Convenio', 'Voucher') NOT NULL,
    `statusPagamento` ENUM('Pago', 'Pendente', 'Cancelado') NOT NULL DEFAULT 'Pendente',
    `observacao` VARCHAR(255) NULL,
    `dataPagamento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `pacienteId` INTEGER NOT NULL,
    `parceiroId` INTEGER NULL,
    `consultorioId` INTEGER NOT NULL,

    INDEX `LancamentoFinanceiro_pacienteId_idx`(`pacienteId`),
    INDEX `LancamentoFinanceiro_parceiroId_idx`(`parceiroId`),
    INDEX `LancamentoFinanceiro_consultorioId_idx`(`consultorioId`),
    PRIMARY KEY (`idLancamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LancamentoFinanceiro` ADD CONSTRAINT `LancamentoFinanceiro_pacienteId_fkey` FOREIGN KEY (`pacienteId`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LancamentoFinanceiro` ADD CONSTRAINT `LancamentoFinanceiro_parceiroId_fkey` FOREIGN KEY (`parceiroId`) REFERENCES `Parceiro`(`idParceiro`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LancamentoFinanceiro` ADD CONSTRAINT `LancamentoFinanceiro_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;
