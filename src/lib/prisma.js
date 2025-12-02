import { PrismaClient } from '@prisma/client';
import 'dotenv/config'; // carrega .env antes de criar o cliente
import { createPool } from 'mariadb';

// Singleton pattern to avoid multiple instances in development (nodemon/hot reload)
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn('WARNING: DATABASE_URL não encontrado. Verifique seu .env.');
}

// Criar pool do driver MariaDB. Algumas versões do driver aceitam string de conexão;
// se necessário adapte para um objeto de configuração.
let pool;
try {
  if (databaseUrl) {
    // O driver 'mariadb' aceita connection string começando com 'mariadb://'
    // Se o DATABASE_URL usar 'mysql://', convertemos para um objeto de config
    // compatível com createPool.
    const urlProto = databaseUrl.split(':', 1)[0];
    if (databaseUrl.startsWith('mariadb:')) {
      pool = createPool(databaseUrl);
    } else {
      // Tentar parse com a classe URL para extrair partes
      try {
        const parsed = new URL(databaseUrl);
        const config = {
          host: parsed.hostname,
          user: parsed.username || undefined,
          password: parsed.password || undefined,
          database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : undefined,
          port: parsed.port ? Number(parsed.port) : undefined,
        };
        // incluir opções query string como propriedades simples
        for (const [k, v] of parsed.searchParams) {
          // convert numeric values when apropriado
          if (!Number.isNaN(Number(v))) config[k] = Number(v);
          else if (v === 'true' || v === 'false') config[k] = v === 'true';
          else config[k] = v;
        }
        pool = createPool(config);
      } catch (err) {
        // Fallback: tentar passar a string inteira — pode falhar se o esquema for mysql://
        pool = createPool(databaseUrl);
      }
    }
  }
} catch (err) {
  console.warn('Não foi possível criar o pool MariaDB a partir de DATABASE_URL:', err?.message || err);
}

// Tentar carregar dinamicamente o adapter do Prisma para MariaDB, se disponível.
// Usamos import() dinâmico (top-level await é suportado em Node >= 14 com ESM).
let adapter;
if (pool) {
  try {
    const mod = await import('@prisma/adapter-mariadb');
    // O pacote pode exportar a classe como named export ou como default.
    const PrismaMariaDB = mod.PrismaMariaDB ?? mod.default ?? null;
    if (PrismaMariaDB) {
      try {
        adapter = new PrismaMariaDB(pool);
      } catch (err) {
        console.warn('Adapter MariaDB encontrado, mas falha ao instanciá-lo:', err?.message || err);
      }
    } else {
      console.warn('@prisma/adapter-mariadb importado, mas não contém PrismaMariaDB export. Usando fallback.');
    }
  } catch (err) {
    // pacote não instalado ou import falhou
    console.warn(
      'Não foi possível importar @prisma/adapter-mariadb dinamicamente (não instalado ou incompatível). Usando fallback para DATABASE_URL.'
    );
  }
}

function createPrismaInstance() {
  const opts = {};
  if (adapter) {
    // Quando o adapter está disponível, passe-o ao PrismaClient
    opts.adapter = adapter;
  } else if (databaseUrl) {
    // Fallback: passar datasources.url para o PrismaClient
    opts.datasources = { db: { url: databaseUrl } };
  }

  return new PrismaClient(opts);
}

let prismaClient;
if (process.env.NODE_ENV === 'production') {
  prismaClient = createPrismaInstance();
} else {
  // store on globalThis to preserve the client across module reloads in dev
  if (!globalThis._prisma) {
    globalThis._prisma = createPrismaInstance();
  }
  prismaClient = globalThis._prisma;
}

// Graceful shutdown: desconecta Prisma e fecha pool do MariaDB
async function shutdown() {
  try {
    if (prismaClient) await prismaClient.$disconnect();
  } catch (e) {
    console.warn('Erro ao desconectar PrismaClient:', e?.message || e);
  }
  try {
    if (pool && typeof pool.end === 'function') await pool.end();
  } catch (e) {
    console.warn('Erro ao encerrar pool MariaDB:', e?.message || e);
  }
}

process.on('beforeExit', shutdown);
process.on('SIGINT', () => {
  shutdown().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  shutdown().finally(() => process.exit(0));
});

export default prismaClient;
