import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrar() {
  console.log('Iniciando migração...');

  // Busca todas as anamneses incluindo os dados do paciente
  const anamneses = await prisma.anamnese.findMany({
    include: { paciente: true },
  });

  for (const anam of anamneses) {
    if (anam.paciente.nFicha) {
      await prisma.anamnese.update({
        where: { idAnam: anam.idAnam },
        data: { nFicha: anam.paciente.nFicha },
      });
    }
  }

  console.log('Migração concluída com sucesso!');
}

migrar();
