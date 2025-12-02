# Checklist de Desenvolvimento: Sistema de Gestão para Consultório de Optometria (SGCO)

Baseado no roteiro detalhado fornecido. Marque cada item conforme for concluído.

## Fase 1: Configuração Inicial e Estrutura Base
### ✔️ Etapas concluídas:

- [x] **1.1.** Configurar ambiente de desenvolvimento (Node.js, npm/yarn, MariaDB).
- [x] **1.2.** Inicializar projeto Node.js com Express.js (`npm init`, `npm install express`).
- [x] **1.3.** Instalar e configurar Prisma ORM (`npm install prisma --save-dev` `npx prisma init --datasource-provider mysql`).
- [x] **1.4.** Configurar string de conexão com o MariaDB no arquivo `.env`.
- [x] **1.5.** Adaptar/Revisar o schema Prisma (`schema.prisma`) com base no exemplo fornecido e nos requisitos.
  - [x] 1.5.1. Definir/Confirmar modelo `Consultorio`.
  - [x] 1.5.2. Definir/Confirmar modelos básicos relacionados (`User`, `Paciente`, `Profissional`, etc., com relacionamentos iniciais).
- [x] **1.6.** Executar a primeira migração Prisma para criar as tabelas no banco (`npx prisma migrate dev --name init`).
- [x] **1.7.** Configurar o EJS como template engine no Express.
- [x] **1.8.** Criar estrutura de pastas do projeto (ex: `routes`, `controllers`, `prisma`, `views`, `public`, `services`, `middlewares`).
- [x] **1.9.** **(Escopo 1 - Obrigatório)** Implementar funcionalidade de Cadastro do Consultório:
  - [x] 1.9.1. Criar rotas, controller e view (EJS) para o formulário de cadastro do consultório.
  - [x] 1.9.2. Implementar lógica no backend para salvar os dados do consultório (será o registro "pai").
  - [x] 1.9.2.1 Corrigir erros idConsultorio
  - [x] 1.9.3. Garantir que futuros registros (usuários, pacientes, etc.) se vinculem a um `consultorioId`.
- [ ] **1.10.** (Opcional) Configurar Swagger para documentação da API (se aplicável).
```
### 🟡 Próximos Passos:

#### 🗃 Banco de Dados:
**PARA FAZER BACKUPS DO DB**
# Exemplo: substitua <db_user>(admin) por seu usuário MySQL. Será pedido password.
mysqldump -h localhost -P 3306 -u admin -p optosystem > ~/optosystem-backup-$(date +%Y%m%d_%H%M).sql

* [ ] Revisar `schema.prisma` ou migrations para garantir todos os relacionamentos necessários (Paciente, Profissional, Diagnóstico, Consulta, Fila)
* [ ] Criar migrations/tabelas para controle financeiro (receitas, despesas)

#### 🔧 Backend:

* [x] Criar CRUD de pacientes com integração à fila de espera
* [x] Criar endpoints para visualização e atualização da fila de espera
* [ ] Criar endpoints para registro de diagnósticos vinculado ao Profissional
* [ ] Criar endpoints para geração de relatórios (fila, atendimentos)

#### 🎨 Frontend:
* [ ] Implementação da autenticação com guard e middleware
* [ ] Criação do layout base e dashboard
* [ ] Desenvolver tela de recepção: cadastro de pacientes + fila
* [ ] Adicionar botões para mudar o status na fila ("aguardando", "em atendimento", etc.)
* [ ] Desenvolver tela de profissional: diagnósticos, tratamento, retorno
* [ ] Criar tela para relatórios de atendimentos e fila

#### 🧩 Divisão em Módulos:

* [x] Módulo de Pacientes (CRUD + integração com fila)
* [ ] Módulo de Fila (visualização, ordenação, status)
* [ ] Módulo de Diagnósticos (registro, associação com consulta)
* [ ] Módulo de Relatórios (atendimentos, fila, financeiro)

#### ✅ Testes:

* [ ] Testar o fluxo de cadastro de pacientes + integração com fila
* [ ] Verificar atualizações de status e baixas automáticas na fila


## Fase 2: Gestão de Usuários e Autenticação/Autorização

- [ ] **2.1.** Refinar modelo `User` no Prisma (adicionar campo `role`: 'Recepcionista', 'Optometrista', 'Admin').
- [ ] **2.2.** Implementar funcionalidade de Cadastro de Usuários (inicialmente via Admin ou script).
- [ ] **2.3.** Implementar hashing de senhas (ex: `bcrypt`).
- [ ] **2.4.** Criar funcionalidade de Login (rota, controller, view).
- [ ] **2.5.** Implementar gerenciamento de sessão (ex: `express-session`) ou JWT para manter o usuário logado.
- [ ] **2.6.** Criar middleware para verificar se o usuário está autenticado.
- [ ] **2.7.** Criar middleware para verificar permissões com base no `role` do usuário (Autorização). Proteger rotas adequadamente.

## Fase 3: Cadastro de Pacientes e Anamnese

- [ ] **3.1.** Refinar/Confirmar modelo `Paciente` no Prisma com todos os campos necessários (incluindo endereço completo, convênio).
- [ ] **3.2.** Refinar/Confirmar modelo `Anamnese` no Prisma (padrão inicial, campos do questionário).
- [ ] **3.3.** Criar rotas e controllers no backend para CRUD completo de Pacientes.
- [ ] **3.4.** Criar rotas e controllers para criar/visualizar Anamnese (vinculada ao Paciente).
- [ ] **3.5.** Desenvolver Views (EJS) para:
  - [ ] 3.5.1. Listagem e Busca de Pacientes (por nome, CPF).
  - [ ] 3.5.2. Formulário de Cadastro/Edição de Paciente (incluir campos de anamnese padrão).
- [ ] **3.6.** Implementar validação de CPF (backend e/ou frontend).
- [ ] **3.7.** Implementar funcionalidade de busca no backend e frontend.
- [ ] **3.8.** _(Opcional/Futuro)_ Implementar importação de pacientes via CSV/Excel.

## Fase 4: Agendamento e Fila de Atendimento

- [ ] **4.1.** Criar/Refinar modelo `Profissional` (Optometrista) no Prisma.
- [ ] **4.2.** Criar/Refinar modelo `Consulta` no Prisma (vincular `Paciente`, `Profissional`, `Consultorio`, adicionar `dataHoraAgendamento`, `statusConsulta` Enum).
- [ ] **4.3.** Criar rotas e controllers para CRUD de Agendamentos (marcar, cancelar, reagendar).
- [ ] **4.4.** Desenvolver Views (EJS) para:
  - [ ] 4.4.1. Visualização de Calendário (integrar biblioteca JS como FullCalendar.js ou similar).
  - [ ] 4.4.2. Formulário de Agendamento (selecionar optometrista, data/hora disponíveis).
  - [ ] 4.4.3. Visualização da Fila de Atendimento (ordenada por chegada/horário).
- [ ] **4.5.** Implementar lógica para buscar horários disponíveis no backend.
- [ ] **4.6.** Implementar funcionalidade de bloqueio de horários (Admin/Optometrista).
- [ ] **4.7.** Implementar atualização do `statusConsulta` (Agendada -> Aguardando -> EmAtendimento -> Finalizada -> Cancelada, etc.).
- [ ] **4.8.** Implementar lógica/interface para notificar Optometrista sobre o próximo paciente (atualização na tela da fila).
- [ ] **4.9.** _(Opcional/Futuro)_ Implementar envio de lembretes (requer integração externa).

## Fase 5: Prontuário Eletrônico e Atendimento

- [ ] **5.1.** Garantir que a `Anamnese` possa ser editada/complementada pelo Optometrista durante a consulta.
- [ ] **5.2.** Criar/Refinar modelo `Diagnostico` no Prisma (vincular à `Consulta`).
- [ ] **5.3.** Criar/Refinar modelo `Receita` no Prisma (vincular à `Consulta`, campos para óculos/lentes/medicamentos).
- [ ] **5.4.** Criar rotas e controllers para:
  - [ ] 5.4.1. Visualizar/Editar Anamnese na consulta.
  - [ ] 5.4.2. Registrar Resultados de Testes/Exames (pode ser campos na `Consulta` ou modelo separado).
  - [ ] 5.4.3. Registrar Diagnóstico.
  - [ ] 5.4.4. Gerar/Salvar Receita.
  - [ ] 5.4.5. Visualizar Histórico do Paciente (Prontuário).
- [ ] **5.5.** Desenvolver Views (EJS) para Optometrista:
  - [ ] 5.5.1. Tela de Atendimento (integrando Anamnese, registro de resultados, diagnóstico, receita).
  - [ ] 5.5.2. Tela de Visualização do Prontuário Completo do Paciente.
  - [ ] 5.5.3. Tela/Funcionalidade para Impressão de Receitas.
- [ ] **5.6.** Implementar armazenamento de arquivos/imagens (upload e associação à `Consulta` ou `Paciente`).
- [ ] **5.7.** Implementar "Controle de lentes" (definir o que significa: histórico de lentes prescritas? estoque?).

## Fase 6: Gestão Financeira e Pagamentos

- [ ] **6.1.** Criar/Refinar modelo `Parceiro` no Prisma (para gestão de vouchers).
- [ ] **6.2.** Criar/Refinar modelo `Pagamento` no Prisma (vincular à `Consulta`, adicionar `formaPagamento` Enum, `valorPago`, `dataPagamento`, etc.).
- [ ] **6.3.** Adicionar campos relevantes à `Consulta` (ex: `valorTotal`, `valorPago`, `statusPagamento` Enum, `parceiroId`, `valorVoucher`, `valorAReceberParceiro`, `dataVencimentoParceiro`).
- [ ] **6.4.** Criar modelos `Despesa` e `Investimento` no Prisma (descrição, valor, data, categoria, parcelamento se aplicável).
- [ ] **6.5.** Criar rotas e controllers para:
  - [ ] 6.5.1. Registrar Pagamentos (incluindo lógica para diferentes formas: dinheiro, cartão, PIX, convênio, voucher).
  - [ ] 6.5.2. Validar e Registrar Vouchers (atualizar valores na `Consulta`).
  - [ ] 6.5.3. CRUD para Despesas e Investimentos (com lógica de parcelamento).
  - [ ] 6.5.4. Marcar recebimento de valores de parceiros.
- [ ] **6.6.** Desenvolver Views (EJS) para:
  - [ ] 6.6.1. Interface de Registro de Pagamento (Recepcionista).
  - [ ] 6.6.2. Interface de Gestão de Vouchers/Parceiros (Admin/Recepcionista).
  - [ ] 6.6.3. Interface para Cadastro de Despesas/Investimentos (Admin).
- [ ] **6.7.** Implementar Geração de Recibos.
- [ ] **6.8.** Implementar lógica para alertas de contas a pagar/receber.

## Fase 7: Relatórios

- [ ] **7.1.** Desenvolver queries/lógica no backend para gerar dados para Relatórios Financeiros:
  - [ ] 7.1.1. Faturamento (por período, forma pgto, optometrista).
  - [ ] 7.1.2. Fluxo de Caixa.
  - [ ] 7.1.3. Valores a Receber de Parceiros.
  - [ ] 7.1.4. Relatório de Despesas (total, por categoria, comparativo).
  - [ ] 7.1.5. Relatório de Investimentos.
- [ ] **7.2.** Desenvolver queries/lógica no backend para gerar dados para Relatórios de Desempenho:
  - [ ] 7.2.1. Nº Pacientes Atendidos (total, por optometrista).
  - [ ] 7.2.2. Tipos de Exames/Procedimentos Realizados.
  - [ ] 7.2.3. Origem dos Pacientes.
- [ ] **7.3.** Desenvolver Views (EJS) para exibir os relatórios (usar tabelas, considerar gráficos com Chart.js).

## Fase 8: Requisitos Não Funcionais e Refinamento

- [ ] **8.1.** **Desempenho:**
  - [ ] 8.1.1. Otimizar queries do banco de dados (usar índices do Prisma, analisar queries lentas).
  - [ ] 8.1.2. Testar tempo de resposta das operações principais.
- [ ] **8.2.** **Segurança:**
  - [ ] 8.2.1. Revisar controle de acesso (AuthZ) em todas as rotas.
  - [ ] 8.2.2. Implementar medidas básicas contra ataques comuns (ex: XSS, CSRF - se aplicável com sessões).
  - [ ] 8.2.3. Configurar rotina de Backup automatizado do banco de dados MariaDB.
  - [ ] 8.2.4. Revisar conformidade com LGPD (acesso restrito a dados sensíveis, logs de acesso se necessário).
- [ ] **8.3.** **Usabilidade:**
  - [ ] 8.3.1. Revisar a interface do usuário (clareza, consistência).
  - [ ] 8.3.2. Realizar testes de usabilidade com usuários finais (Recepcionista, Optometrista).
- [ ] **8.4.** **Disponibilidade:**
  - [ ] 8.4.1. Garantir que o servidor local e a aplicação estejam configurados para rodar de forma estável.
- [ ] **8.5.** Realizar testes abrangentes (Unitários, Integração, Funcionais).
- [ ] **8.6.** Corrigir bugs e refinar funcionalidades.

## Fase 9: Implantação e Documentação

- [ ] **9.1.** Preparar ambiente de produção no servidor local.
- [ ] **9.2.** Realizar a implantação da aplicação (backend e frontend).
- [ ] **9.3.** Criar documentação para usuários finais (manual básico).
- [ ] **9.4.** (Opcional) Criar documentação técnica.

## Fase 10: Melhorias Futuras (Pós-MVP)

- [ ] **10.1.** Integração com WhatsApp/SMS para lembretes.
- [ ] **10.2.** Integração com gateways de pagamento online.
- [ ] **10.3.** Chatbots para agendamento/FAQ.
- [ ] **10.4.** Agendamento online via site/redes sociais.
- [ ] **10.5.** Módulo de Gestão de Estoque (lentes, produtos).
- [ ] **10.6.** Ferramentas de Marketing (e-mail marketing).
- [ ] **10.7.** (Opcional) Migração do Frontend para React (se EJS se tornar limitante).
