#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import prisma from '../src/lib/prisma.js';

const CSV_PATH = path.join(process.cwd(), 'docs/proximos passos/CONSULTÓRIO DE OPTOMETRIA CAIXA - MARÍLIA.csv');

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes ""
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Arquivo não encontrado: ${CSV_PATH}`);
    process.exit(1);
  }

  console.log('--- Iniciando Importação de Pacientes ---');

  // 1. Obter Consultorio
  let consultorio = await prisma.consultorio.findFirst();
  if (!consultorio) {
    console.error('Nenhum consultório encontrado no banco de dados. Crie um consultório primeiro.');
    process.exit(1);
  }
  const consultorioId = consultorio.idConsultorio;
  console.log(`Usando Consultório: ${consultorio.nome} (ID: ${consultorioId})`);

  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let importedCount = 0;
  let skippedCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (lineCount <= 3 || !line.trim()) {
      continue; // Pula as primeiras 3 linhas (cabeçalho e lixo)
    }

    const columns = parseCSVLine(line);
    if (columns.length < 5 || !columns[4]) {
      skippedCount++;
      continue;
    }

    const dataAtend = columns[0]; // DATA
    const nFichaStr = columns[3]; // FICHA
    const nome = columns[4]; // NOME
    const profissao = columns[5] || 'N/A'; // PROFISSÃO
    const telefone = columns[6] || 'N/A'; // TELEFONE
    const cidade = columns[7] || 'N/A'; // CIDADE

    // LOJA -> Parceiro? (Opcional por enquanto)
    // const loja = columns[10];

    const nFicha = parseInt(nFichaStr) || null;

    try {
      // Verificar se o paciente já existe pelo nome (evitar duplicatas básicas)
      const existing = await prisma.paciente.findFirst({
        where: {
          nome: nome,
          consultorioId: consultorioId,
        },
      });

      if (existing) {
        skippedCount++;
        // console.log(`Paciente já existe: ${nome}`);
        continue;
      }

      const novoPaciente = await prisma.paciente.create({
        data: {
          nome: nome,
          dataAtend: dataAtend,
          profissao: profissao.substring(0, 30),
          celular: telefone.substring(0, 15) || 'N/A',
          cidade: cidade.substring(0, 30),
          // Campos obrigatórios ausentes no CSV:
          dataNasc: new Date(1900, 0, 1),
          idade: 0,
          endereco: 'N/A',
          numero: 0,
          bairro: 'N/A',
          consultorioId: consultorioId,
          status: 'Antigo', // Ou outro status padrão para importados
        },
      });

      // Se houver ficha, cria uma anamnese básica com o número da ficha
      if (nFicha) {
        await prisma.anamnese.create({
          data: {
            pacienteId: novoPaciente.idPaciente,
            consultorioId: consultorioId,
            nFicha: nFicha,
            motivo: 'Importado do CSV',
            ultimoExame: 'N/D',
            usuarioOculos: false,
            usuarioLC: false,
            dm: false,
            has: false,
            glauc: false,
          }
        });
      }

      importedCount++;
      if (importedCount % 100 === 0) {
        console.log(`Progresso: ${importedCount} pacientes importados...`);
      }
    } catch (error) {
      console.error(`Erro ao importar linha ${lineCount} (${nome}):`, error.message);
      skippedCount++;
    }
  }

  console.log('\n--- Resumo da Importação ---');
  console.log(`Total de linhas processadas: ${lineCount}`);
  console.log(`Pacientes importados: ${importedCount}`);
  console.log(`Pacientes pulados (ou erro): ${skippedCount}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Erro crítico no script:', err);
  try {
    await prisma.$disconnect();
  } catch (e) {}
  process.exit(1);
});
