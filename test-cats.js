const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rootCats = await prisma.category.findMany({
    where: { parentId: null }
  });
  console.log("ROOT CATEGORIES:");
  console.table(rootCats.map(c => ({ id: c.id, name: c.nameAz, active: c.isActive })));

  const subCats = await prisma.category.findMany({
    where: { parentId: { not: null } }
  });
  console.log("\nSUB CATEGORIES:");
  console.table(subCats.map(c => ({ id: c.id, name: c.nameAz, parent: c.parentId, active: c.isActive })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
