import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        name: "基礎服務",
        description: "適合一般預約需求的基礎服務項目。",
        durationMinutes: 60,
        price: 1000,
        isActive: true,
      },
      {
        name: "進階服務",
        description: "適合需要較完整時間安排的進階服務。",
        durationMinutes: 90,
        price: 1500,
        isActive: true,
      },
      {
        name: "停用測試服務",
        description: "這筆資料用來測試停用服務不會顯示在使用者端。",
        durationMinutes: 30,
        price: 500,
        isActive: false,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });