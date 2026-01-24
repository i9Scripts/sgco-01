-- DropIndex
DROP INDEX `Paciente_cpf_key` ON `Paciente`;

-- CreateIndex
CREATE INDEX `Paciente_cpf_idx` ON `Paciente`(`cpf`);
