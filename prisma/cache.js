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
