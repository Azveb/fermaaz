const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    let block = await prisma.dynamicBlock.findFirst({
      where: { page: "system", type: "admin_config" }
    });

    if (block) {
      console.log("Block exists, updating...");
      await prisma.dynamicBlock.update({
        where: { id: block.id },
        data: { props: { test: 1 } }
      });
    } else {
      console.log("Block does not exist, creating...");
      await prisma.dynamicBlock.create({
        data: {
          page: "system",
          type: "admin_config",
          props: { test: 1 }
        }
      });
    }
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
