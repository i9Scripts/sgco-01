Essa é uma ficha clínica de optometria bastante completa, cobrindo desde a triagem inicial até o diagnóstico final e conduta.

O ideal é normalizar os dados em tabelas relacionadas para evitar que uma única tabela fique "gigante" e difícil de manter. Estruturei o schema focando em quatro pilares: **Paciente**, **Optometrista**, **Consulta** (o núcleo) e sub-tabelas para detalhes técnicos (como a acuidade visual e a prescrição final).

Aqui está uma proposta de schema robusta:

---

### Prisma Schema (Optometria)

```prisma

// --- MODELOS PRINCIPAIS ---

model Optometrista {
  id        String   @id @default(uuid())
  nome      String
  registro  String   @unique // Registro profissional
  consultas Consulta[]
}

model Paciente {
  id              String   @id @default(uuid())
  nome            String
  dataNascimento  DateTime
  rg              String?  @unique
  ocupacao        String?
  sexo            Sexo
  telefone        String?
  escolaridade    String?
  email           String?
  responsavel     String?
  parentesco      String?
  consultas       Consulta[]
}

model Consulta {
  id                String   @id @default(uuid())
  data              DateTime @default(now())
  inicio            DateTime?
  termino           DateTime?
  pacienteId        String
  paciente          Paciente @relation(fields: [pacienteId], references: [id])
  optometristaId    String
  optometrista      Optometrista @relation(fields: [optometristaId], references: [id])

  // Motivo e Anamnese
  motivoPrincipal   String?
  antecedentes      Antecedentes?
  anamneseOutros    String?

  // Dados Técnicos (Relacionamentos 1:1 para organização)
  lesometria        Lesometria?
  ceratometria      Ceratometria?
  acuidadeVisual    AcuidadeVisual?
  exameMotor        ExameMotor?
  biomicroscopia    Biomicroscopia?
  oftalmoscopia     Oftalmoscopia?
  rxFinal           PrescricaoFinal?

  // Conclusão
  diagnosticoRefrativoOD String?
  diagnosticoRefrativoOE String?
  diagnosticoMotor       String?
  diagnosticoPatologico  String?
  conduta                Conduta?
  observacoesFinais      String?
  
  // Termos
  autorizacaoAssinada    Boolean @default(false)
  encaminhamentoAssinado Boolean @default(false)
}

// --- SUB-MODELOS DE APOIO ---

model Antecedentes {
  id             String   @id @default(uuid())
  consultaId     String   @unique
  consulta       Consulta @relation(fields: [consultaId], references: [id])
  
  // Pessoais (Exemplo: Diabetes, HAS, Glaucoma...)
  pessoalDiabetes Boolean @default(false)
  pessoalHAS      Boolean @default(false)
  pessoalCirurgia String?
  
  // Familiares
  familiarDiabetes Boolean @default(false)
  familiarGlaucoma Boolean @default(false)
}

model AcuidadeVisual {
  id          String   @id @default(uuid())
  consultaId  String   @unique
  consulta    Consulta @relation(fields: [consultaId], references: [id])
  
  // Sem Correção (S/C)
  odVlSc      String?
  odVpSc      String?
  oeVlSc      String?
  oeVpSc      String?
  
  // Com Correção (C/C)
  odVlCc      String?
  oeVlCc      String?
  
  optotipo    String? @default("Snellen")
}

model PrescricaoFinal {
  id          String   @id @default(uuid())
  consultaId  String   @unique
  consulta    Consulta @relation(fields: [consultaId], references: [id])

  // Olho Direito
  odEsferico  Float?
  odCilindro  Float?
  odEixo      Int?
  odAdicao    Float?
  
  // Olho Esquerdo
  oeEsferico  Float?
  oeCilindro  Float?
  oeEixo      Int?
  
  avVl        String?
  avVp        String?
}

// Modelos simplificados para os outros campos técnicos...
model ExameMotor {
  id          String   @id @default(uuid())
  consultaId  String   @unique
  consulta    Consulta @relation(fields: [consultaId], references: [id])
  ppc         String?
  hirshberg   String?
  coverTeste  String?
}

model Biomicroscopia {
  id          String   @id @default(uuid())
  consultaId  String   @unique
  consulta    Consulta @relation(fields: [consultaId], references: [id])
  corneaOD    String?
  conjuntiva  String?
  iris        String?
}

model Oftalmoscopia {
  id          String   @id @default(uuid())
  consultaId  String   @unique
  consulta    Consulta @relation(fields: [consultaId], references: [id])
  escavacaoOD Float?
  escavacaoOE Float?
  papila      String?
  macula      String?
}

// --- ENUMS ---

enum Sexo {
  MASCULINO
  FEMININO
  OUTRO
}

enum Conduta {
  PRESCRITO
  PRESCRITO_E_ORIENTADO
  ENCAMINHADO
  DISPENSADO
}

```

---

### Observações sobre o Schema:

* **Normalização:** Dividi em modelos como `AcuidadeVisual`, `PrescricaoFinal` e `Oftalmoscopia`. Isso evita que a tabela de `Consulta` tenha 200 colunas, facilitando a indexação e a leitura dos dados. 


* 
**Tipagem:** Usei `Float` para graus esféricos/cilíndricos e `Int` para eixos, o que permite cálculos matemáticos futuramente, em vez de apenas salvar como texto. 


* 
**Enums:** Para campos com opções fixas (como Sexo ou Conduta), usei `enum` para garantir a integridade dos dados e evitar erros de digitação no banco. 


* 
**Termos Legais:** Incluí campos booleanos para registrar se o paciente deu o "de acordo" nos termos de autorização e encaminhamento citados no final do documento. 



**Gostaria que eu detalhasse algum campo específico ou gerasse um exemplo de como seria a inserção de dados (query) para esse schema?**
