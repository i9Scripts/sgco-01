-- CreateTable
CREATE TABLE `Consultorio` (
    `idConsultorio` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `endereco` VARCHAR(60) NOT NULL,
    `cpf` VARCHAR(15) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `bairro` VARCHAR(60) NOT NULL,
    `celular` VARCHAR(15) NOT NULL,
    `cep` VARCHAR(9) NULL,
    `cidade` VARCHAR(30) NOT NULL,
    `numero` INTEGER NOT NULL,
    `profissao` VARCHAR(30) NOT NULL,
    `responsavel` VARCHAR(60) NULL,
    `numeroSerie` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `Consultorio_numeroSerie_key`(`numeroSerie`),
    INDEX `Consultorio_cpf_idx`(`cpf`),
    INDEX `Consultorio_nome_idx`(`nome`),
    INDEX `Consultorio_responsavel_idx`(`responsavel`),
    PRIMARY KEY (`idConsultorio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `email` VARCHAR(30) NOT NULL,
    `celular` VARCHAR(15) NOT NULL,
    `password` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `consultorioId` INTEGER NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_consultorioId_fkey`(`consultorioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Paciente` (
    `idPaciente` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `responsavel` VARCHAR(60) NULL,
    `dataNasc` DATE NOT NULL,
    `idade` INTEGER NOT NULL,
    `celular` VARCHAR(15) NOT NULL,
    `cep` VARCHAR(9) NULL,
    `endereco` VARCHAR(60) NOT NULL,
    `numero` INTEGER NOT NULL,
    `bairro` VARCHAR(60) NOT NULL,
    `cidade` VARCHAR(30) NOT NULL,
    `cpf` VARCHAR(15) NULL,
    `profissao` VARCHAR(30) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `consultorioId` INTEGER NOT NULL,

    UNIQUE INDEX `Paciente_cpf_key`(`cpf`),
    INDEX `Paciente_nome_idx`(`nome`),
    INDEX `Paciente_responsavel_idx`(`responsavel`),
    INDEX `Paciente_celular_idx`(`celular`),
    INDEX `Paciente_createdAt_idx`(`createdAt`),
    INDEX `Paciente_consultorioId_fkey`(`consultorioId`),
    PRIMARY KEY (`idPaciente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profissional` (
    `idProfissional` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `especialidade` VARCHAR(30) NOT NULL,
    `celular` VARCHAR(15) NOT NULL,
    `consultorioId` INTEGER NOT NULL,
    `cboo` VARCHAR(10) NOT NULL,

    INDEX `Profissional_nome_idx`(`nome`),
    INDEX `Profissional_celular_idx`(`celular`),
    INDEX `Profissional_cboo_idx`(`cboo`),
    INDEX `Profissional_consultorioId_fkey`(`consultorioId`),
    PRIMARY KEY (`idProfissional`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parceiro` (
    `idParceiro` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `endereco` VARCHAR(60) NULL,
    `telefone` VARCHAR(15) NOT NULL,
    `contato` VARCHAR(30) NULL,
    `credito` DECIMAL(65, 30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `consultorioId` INTEGER NOT NULL,

    INDEX `Parceiro_nome_idx`(`nome`),
    INDEX `Parceiro_consultorioId_fkey`(`consultorioId`),
    PRIMARY KEY (`idParceiro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Anamnese` (
    `idAnam` INTEGER NOT NULL AUTO_INCREMENT,
    `motivo` VARCHAR(100) NOT NULL,
    `ultimoExame` VARCHAR(20) NOT NULL,
    `usuarioOculos` BOOLEAN NOT NULL,
    `usuarioLC` BOOLEAN NOT NULL,
    `trauma` VARCHAR(50) NULL,
    `dm` BOOLEAN NOT NULL,
    `has` BOOLEAN NOT NULL,
    `glauc` BOOLEAN NOT NULL,
    `dmFam` VARCHAR(50) NULL,
    `hasFam` VARCHAR(50) NULL,
    `glaucFam` VARCHAR(50) NULL,
    `sintomas` VARCHAR(50) NULL,
    `remedio` VARCHAR(50) NULL,
    `obsGerais` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `pacienteId` INTEGER NOT NULL,
    `consultorioId` INTEGER NOT NULL,
    `adicao` VARCHAR(6) NULL,
    `cilOD` VARCHAR(6) NULL,
    `cilOE` VARCHAR(6) NULL,
    `eixoOD` VARCHAR(3) NULL,
    `eixoOE` VARCHAR(3) NULL,
    `esfOD` VARCHAR(6) NULL,
    `esfOE` VARCHAR(6) NULL,

    INDEX `Anamnese_consultorioId_fkey`(`consultorioId`),
    INDEX `Anamnese_pacienteId_fkey`(`pacienteId`),
    PRIMARY KEY (`idAnam`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Diagnostico` (
    `idDiagnostico` INTEGER NOT NULL AUTO_INCREMENT,
    `esfOD` VARCHAR(6) NOT NULL,
    `cilOD` VARCHAR(6) NOT NULL,
    `eixoOD` VARCHAR(3) NOT NULL,
    `esfOE` VARCHAR(6) NOT NULL,
    `cilOE` VARCHAR(6) NOT NULL,
    `eixoOE` VARCHAR(3) NOT NULL,
    `adicao` VARCHAR(6) NOT NULL,
    `descricao` VARCHAR(200) NOT NULL,
    `pacienteId` INTEGER NOT NULL,
    `profissionalId` INTEGER NOT NULL,
    `consultorioId` INTEGER NOT NULL,

    INDEX `Diagnostico_consultorioId_fkey`(`consultorioId`),
    INDEX `Diagnostico_pacienteId_fkey`(`pacienteId`),
    INDEX `Diagnostico_profissionalId_fkey`(`profissionalId`),
    PRIMARY KEY (`idDiagnostico`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Consulta` (
    `idConsulta` INTEGER NOT NULL AUTO_INCREMENT,
    `valorPago` DECIMAL(65, 30) NOT NULL,
    `statusConsulta` ENUM('Agendada', 'EmAtendimento', 'Finalizada', 'Cancelada', 'NaoCompareceu', 'Remarcada') NOT NULL DEFAULT 'Agendada',
    `dataVenciPagParceiro` DATE NULL,
    `valorAPagarParceiro` DECIMAL(65, 30) NULL,
    `valorTotal` DECIMAL(65, 30) NOT NULL,
    `statusPagamento` ENUM('Pago', 'Pendente', 'Cancelado') NOT NULL DEFAULT 'Pendente',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `pacienteId` INTEGER NOT NULL,
    `profissionalId` INTEGER NOT NULL,
    `anamneseId` INTEGER NOT NULL,
    `parceiroId` INTEGER NULL,
    `diagnosticoId` INTEGER NOT NULL,
    `consultorioId` INTEGER NOT NULL,

    INDEX `Consulta_pacienteId_idx`(`pacienteId`),
    INDEX `Consulta_profissionalId_idx`(`profissionalId`),
    INDEX `Consulta_anamneseId_idx`(`anamneseId`),
    INDEX `Consulta_parceiroId_idx`(`parceiroId`),
    INDEX `Consulta_diagnosticoId_idx`(`diagnosticoId`),
    INDEX `Consulta_consultorioId_fkey`(`consultorioId`),
    PRIMARY KEY (`idConsulta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItensVenda` (
    `idItenVenda` INTEGER NOT NULL AUTO_INCREMENT,
    `quantidade` INTEGER NOT NULL,
    `valorUnitario` DECIMAL(65, 30) NOT NULL,
    `produtoId` INTEGER NOT NULL,
    `consultaId` INTEGER NOT NULL,
    `consultorioId` INTEGER NOT NULL,

    INDEX `ItensVenda_consultaId_fkey`(`consultaId`),
    INDEX `ItensVenda_consultorioId_fkey`(`consultorioId`),
    INDEX `ItensVenda_produtoId_fkey`(`produtoId`),
    PRIMARY KEY (`idItenVenda`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pagamento` (
    `idPagamento` INTEGER NOT NULL AUTO_INCREMENT,
    `valorPago` DECIMAL(65, 30) NOT NULL,
    `dataPagamento` DATE NOT NULL,
    `observacao` VARCHAR(255) NOT NULL,
    `formaPagamento` ENUM('Dinheiro', 'CartaoCredito', 'CartaoDebito', 'PIX', 'Cheque', 'Convenio', 'Voucher') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `itensVendaId` INTEGER NOT NULL,
    `consultaId` INTEGER NULL,
    `consultorioId` INTEGER NOT NULL,

    INDEX `Pagamento_consultaId_fkey`(`consultaId`),
    INDEX `Pagamento_consultorioId_fkey`(`consultorioId`),
    INDEX `Pagamento_itensVendaId_fkey`(`itensVendaId`),
    PRIMARY KEY (`idPagamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produto` (
    `idProduto` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(100) NOT NULL,
    `preco` DECIMAL(65, 30) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `consultorioId` INTEGER NOT NULL,

    INDEX `Produto_consultorioId_fkey`(`consultorioId`),
    PRIMARY KEY (`idProduto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `migrations` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(255) NOT NULL,
    `batch` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `consultorio_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verified_at` TIMESTAMP(0) NULL,
    `password` VARCHAR(255) NOT NULL,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paciente` ADD CONSTRAINT `Paciente_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profissional` ADD CONSTRAINT `Profissional_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parceiro` ADD CONSTRAINT `Parceiro_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anamnese` ADD CONSTRAINT `Anamnese_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anamnese` ADD CONSTRAINT `Anamnese_pacienteId_fkey` FOREIGN KEY (`pacienteId`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diagnostico` ADD CONSTRAINT `Diagnostico_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diagnostico` ADD CONSTRAINT `Diagnostico_pacienteId_fkey` FOREIGN KEY (`pacienteId`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diagnostico` ADD CONSTRAINT `Diagnostico_profissionalId_fkey` FOREIGN KEY (`profissionalId`) REFERENCES `Profissional`(`idProfissional`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consulta` ADD CONSTRAINT `Consulta_anamneseId_fkey` FOREIGN KEY (`anamneseId`) REFERENCES `Anamnese`(`idAnam`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consulta` ADD CONSTRAINT `Consulta_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consulta` ADD CONSTRAINT `Consulta_diagnosticoId_fkey` FOREIGN KEY (`diagnosticoId`) REFERENCES `Diagnostico`(`idDiagnostico`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consulta` ADD CONSTRAINT `Consulta_pacienteId_fkey` FOREIGN KEY (`pacienteId`) REFERENCES `Paciente`(`idPaciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consulta` ADD CONSTRAINT `Consulta_parceiroId_fkey` FOREIGN KEY (`parceiroId`) REFERENCES `Parceiro`(`idParceiro`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consulta` ADD CONSTRAINT `Consulta_profissionalId_fkey` FOREIGN KEY (`profissionalId`) REFERENCES `Profissional`(`idProfissional`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItensVenda` ADD CONSTRAINT `ItensVenda_consultaId_fkey` FOREIGN KEY (`consultaId`) REFERENCES `Consulta`(`idConsulta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItensVenda` ADD CONSTRAINT `ItensVenda_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItensVenda` ADD CONSTRAINT `ItensVenda_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`idProduto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagamento` ADD CONSTRAINT `Pagamento_consultaId_fkey` FOREIGN KEY (`consultaId`) REFERENCES `Consulta`(`idConsulta`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagamento` ADD CONSTRAINT `Pagamento_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagamento` ADD CONSTRAINT `Pagamento_itensVendaId_fkey` FOREIGN KEY (`itensVendaId`) REFERENCES `ItensVenda`(`idItenVenda`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produto` ADD CONSTRAINT `Produto_consultorioId_fkey` FOREIGN KEY (`consultorioId`) REFERENCES `Consultorio`(`idConsultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;
