Um link para ir direto a cobrança sem fazer anamnese ou editar os dados do paciente (/financeiro/selecionar-paciente)

✦ I will enter plan mode to detail the migration strategy and ensure no data is lost during the schema changes.

╭────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ ✓  Enter Plan Mode Significant schema changes in the finance module require a careful migration strategy to prevent data loss. I need to map old fields to ne… │
│                                                                                                                                                                │
│ Switching to Plan mode: Significant schema changes in the finance module require a careful migration strategy to prevent data loss. I need to map old fields   │
│ to new models and fields, and update controllers and views accordingly.                                                                                        │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯

✦ I will read the first 100 lines of backup_json/paciente.json to see how naFila is stored.


✦ I will use grep_search with no_ignore: true to read backup_json/paciente.json.

  ✓  SearchText  'naFila' within ./ → Found 10 matches (limited)

✦ I will read src/controllers/financeiroController.js to understand how financial records are currently handled.

  ✓  ReadFile  src/.../financeiroController.js

✦ I will read src/controllers/pacienteController.js.

  ✓  ReadFile  src/.../pacienteController.js

✦ I will read src/controllers/indexController.js.

  ✓  ReadFile  src/controllers/indexController.js

✦ I will create the implementation plan to refactor the finance module and migrate the schema.


✦ I will write the implementation plan to the correct absolute path.


✦ Entendido. Analisei o arquivo prisma/mudar_no_schema.md e o prisma/schema.prisma atual, além dos backups em JSON. A mudança é profunda, especialmente na parte
  financeira e no controle da fila de espera (que sai de Paciente e vai para Consulta).

  Para garantir que nenhum dado seja perdido, minha estratégia será:

   1. Atualizar o Schema: Aplicar as mudanças no prisma/schema.prisma.
   2. Script de Migração Customizado: Criar um script (scripts/migrate_data_v2.mjs) que lerá os backups JSON e populará o novo banco de dados. Isso é muito mais
      seguro do que deixar o Prisma tentar migrar dados automaticamente entre estruturas tão diferentes.
       * Mapearei valorFinal de LancamentoFinanceiro para o novo valorTotal.
       * Criarei registros na nova tabela Pagamento para todos os lançamentos que já estavam pagos.
       * Transferirei o status naFila dos pacientes para a consulta mais recente deles.
   3. Refatoração de Código: Atualizar todos os controllers (financeiro, paciente, index, etc.) e as views EJS para trabalharem com a nova estrutura.

  Abaixo está o plano detalhado:

  Plano: Refatoração do Módulo Financeiro e Migração de Dados

  Mudanças Principais

  1. Atualização do Schema (prisma/schema.prisma)
   - LancamentoFinanceiro: Agora utiliza tipo, status, valorTotal e dataVencimento. Campos antigos de migração serão removidos.
   - Consulta: Remoção de campos financeiros (agora centralizados no Lançamento). Adição de naFila e statusFila para histórico de atendimento.
   - Paciente: Remoção do campo naFila.
   - LancamentoItem: Remoção de consultaId (o vínculo será via LancamentoFinanceiro).
   - Pagamento: Agora vinculado a LancamentoFinanceiro.

  2. Migração de Dados
   - Desenvolver um script que lê os arquivos em backup_json/.
   - Recompor as relações financeiras garantindo que o histórico de pagamentos e dívidas seja preservado.

  3. Atualização de Controllers e Views
   - Ajustar a lógica de cobrança para suportar múltiplos pagamentos por lançamento.
   - Ajustar o Dashboard e a Fila de Espera para lerem da tabela Consulta.

  ---

  Você concorda com essa abordagem? Se sim, prosseguirei com a atualização do schema.prisma e a criação do script de migração.

---

✦ Concluí a refatoração completa do módulo financeiro e da fila de espera, conforme solicitado. Como prometido, realizei a migração sem perda de dados, utilizando os
  backups em JSON para reconstruir o banco de dados na nova estrutura.

  Resumo das Mudanças:

   1. Banco de Dados (Prisma):
       * Financeiro: Centralizamos tudo em LancamentoFinanceiro e Pagamento. Campos antigos de migração (como valorBruto, valorFinal) foram removidos e substituídos
         por valorTotal, tipo e status.
       * Fila de Espera: O controle da fila saiu da tabela Paciente e agora reside na tabela Consulta (naFila, statusFila), permitindo um histórico real de
         atendimentos por ciclo.
       * Vínculos: Anamnese e Diagnostico agora possuem relação única com a Consulta.

   2. Migração de Dados:
       * Realizei um reset controlado do banco local e executei um script customizado que mapeou cada registro dos seus arquivos JSON para o novo formato.
       * Registros que estavam marcados como "Pagos" geraram automaticamente entradas na nova tabela de Pagamento.
       * O status de pacientes que estavam na fila foi transferido para a consulta mais recente de cada um.

   3. Controllers e Lógica:
       * Financeiro: Atualizado para suportar múltiplos pagamentos e o novo fluxo de cobrança.
       * Pacientes/Anamnese: Ajustados para que a entrada na fila crie ou atualize uma Consulta.
       * Middleware de Fila: Refatorado para carregar os dados globalmente a partir do novo modelo.

   4. Interface (Views):
       * Dashboard financeiro, Extrato, Vendas do Dia e Checkout (cobrar.ejs) foram todos atualizados para ler os novos campos.
       * A Fila de Espera no dashboard da recepção e do profissional continua funcionando perfeitamente, agora baseada em consultas ativas.

  O sistema está pronto para uso com a nova arquitetura, muito mais robusta e preparada para o futuro do módulo financeiro.
