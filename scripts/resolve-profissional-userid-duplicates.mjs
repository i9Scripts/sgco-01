#!/usr/bin/env node
import 'dotenv/config';
import prisma from '../src/lib/prisma.js';

async function main() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const dry = args.includes('--dry-run') || !fix;

  console.log('Detectando duplicatas em Profissional.userId...');

  // Pega todos os profissionais com userId não nulo
  const profs = await prisma.profissional.findMany({ where: { userId: { not: null } }, orderBy: { userId: 'asc' } });

  const map = new Map();
  for (const p of profs) {
    const key = String(p.userId);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }

  const duplicates = [];
  for (const [userId, list] of map.entries()) {
    if (list.length > 1) duplicates.push({ userId, list });
  }

  if (duplicates.length === 0) {
    console.log('Nenhuma duplicata encontrada.');
    process.exit(0);
  }

  console.log(`Encontradas ${duplicates.length} userId(s) com múltiplos Profissionais:`);
  for (const d of duplicates) {
    console.log(`\nuserId = ${d.userId} -> ${d.list.length} profissionais:`);
    for (const p of d.list) {
      console.log(`  id: ${p.idProfissional}, nome: "${p.nome}", celular: "${p.celular}"`);
    }
  }

  if (dry) {
    console.log('\nModo somente leitura. Para aplicar correção, execute com --fix.');
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log('\nAplicando correção: deixaremos apenas o profissional com menor id e removeremos userId dos demais.');
  for (const d of duplicates) {
    const sorted = d.list.sort((a, b) => a.idProfissional - b.idProfissional);
    const keeper = sorted[0];
    const toNull = sorted.slice(1);
    console.log(
      `\nPreservando id ${keeper.idProfissional} (${keeper.nome}). Removendo userId de ${toNull.length} registros...`
    );
    for (const item of toNull) {
      await prisma.profissional.update({ where: { idProfissional: item.idProfissional }, data: { userId: null } });
      console.log(`  atualizado id ${item.idProfissional} -> userId = null`);
    }
  }

  console.log('\nCorreção aplicada. Agora você pode gerar a migration novamente.');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Erro no script:', err);
  try {
    await prisma.$disconnect();
  } catch (e) {}
  process.exit(1);
});
