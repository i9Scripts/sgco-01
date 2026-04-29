import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(process.cwd(), 'backup_json');

async function exportTable(modelName) {
  try {
    console.log(`Exportando ${modelName}...`);
    const data = await prisma[modelName].findMany();
    const filePath = path.join(BACKUP_DIR, `${modelName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2), 'utf-8');
    console.log(`Sucesso: ${modelName} exportado para ${filePath}`);
  } catch (error) {
    console.error(`Erro ao exportar ${modelName}:`, error.message);
  }
}

async function main() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
  }

  // Lista de modelos baseada no schema.prisma
  const models = [
    'agendamento',
    'consultorio',
    'user',
    'paciente',
    'profissional',
    'parceiro',
    'lancamentoFinanceiro',
    'anamnese',
    'diagnostico',
    'consulta',
    'pagamento',
    'produto',
    'servico',
    'lancamentoItem',
    'migrations'
  ];

  for (const model of models) {
    await exportTable(model);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
