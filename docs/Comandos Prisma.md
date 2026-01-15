# Opcional: exportar DATABASE_URL se não estiver no .env
export DATABASE_URL="mysql://user:senha@host:3306/nome_do_banco"

# Criar e aplicar a migration localmente (gera migration + atualiza DB + regenera client)
npx prisma migrate dev --name add_createdAt_to_diagnostico

# (Opcional) Apenas criar a migration sem aplicar:
npx prisma migrate dev --create-only --name add_createdAt_to_diagnostico

# Garantir que o Prisma Client esteja atualizado
npx prisma generate

# Em produção: aplicar migrations já criadas (NÃO usar migrate dev)
npx prisma migrate deploy
---

# Procedimento diferente !!!

# Faça backup do banco (sempre). Exemplo MySQL:
mysqldump -u user -p nome_do_banco > backup_before_migration.sql

# Gere a migration somente (não aplique ainda):
npx prisma migrate dev --create-only --name add_createdAt_updatedAt_to_diagnostico

# Abra o arquivo criado em prisma/migrations/<timestamp>_add_createdAt_updatedAt_to_diagnostico/migration.sql e substitua/edite o conteúdo para algo apropriado ao MySQL, por exemplo:
ALTER TABLE `Diagnostico`
  ADD COLUMN `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

(Isto cria as colunas com valores padrão para as linhas existentes e faz updatedAt atualizar automaticamente.)

Se você preferir duas etapas mais seguras:

Primeiro adicionar as colunas como NULLables,
Backfill com NOW(),
Depois tornar NOT NULL e adicionar DEFAULT/ON UPDATE.

# Exemplo em três comandos SQL:
ALTER TABLE `Diagnostico` ADD COLUMN `createdAt` DATETIME NULL;
ALTER TABLE `Diagnostico` ADD COLUMN `updatedAt` DATETIME NULL;
UPDATE `Diagnostico` SET createdAt = COALESCE(createdAt, NOW()), updatedAt = COALESCE(updatedAt, NOW());
ALTER TABLE `Diagnostico` MODIFY COLUMN `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `Diagnostico` MODIFY COLUMN `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

# Aplique a migration (agora que o SQL está ajustado):
npx prisma migrate dev

# Regere o Prisma Client:
npx prisma generate

---

Precauções:

Verifique o SQL gerado antes de aplicar.
Se estiver em produção, use npx prisma migrate deploy com DATABASE_URL apontando para produção (após testes).