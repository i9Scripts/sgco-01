// Compatibiliza o cache do Prisma com o cliente centralizado em `src/lib/prisma.js`
// O projeto usa ESM ("type": "module"), mas mantemos este arquivo em CommonJS
// porque algumas ferramentas/devs podem esperar esse módulo. Ele apenas re-exporta
// o cliente Prisma já criado em `src/lib/prisma.js`.

// Import dinamicamente o cliente ESM e re-exporto via module.exports para compatibilidade CJS.
(async () => {
  try {
    const prismaModule = await import('../src/lib/prisma.js');
    // prismaModule.default é o cliente exportado por src/lib/prisma.js
    module.exports = prismaModule.default;
  } catch (err) {
    // Se a import dinâmica falhar, crio um fallback local (menos desejável)
    // Nota: este fallback não deve ocorrer em execução normal se src/lib/prisma.js existir
    const { PrismaClient } = require('@prisma/client');
    let cachedPrisma;
    if (process.env.NODE_ENV !== 'production') {
      if (!cachedPrisma) {
        cachedPrisma = new PrismaClient();
      }
      module.exports = cachedPrisma;
    } else {
      module.exports = new PrismaClient();
    }
  }
})();
