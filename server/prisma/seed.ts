import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelName of modelNames) {
    const model = prisma[modelName as keyof typeof prisma] as
      | { deleteMany: () => Promise<unknown> }
      | undefined;
    if (model && 'deleteMany' in model) {
      await model.deleteMany();
      console.log(`Cleared data from ${modelName}`);
    } else {
      console.error(
        `Model ${modelName} not found. Please ensure the model name is correctly specified.`
      );
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, 'seedData');

  const orderedFileNames = [
    'products.json',
    'expenseSummary.json',
    'sales.json',
    'salesSummary.json',
    'purchases.json',
    'purchaseSummary.json',
    'users.json',
    'expenses.json',
    'expenseByCategory.json',
  ];

  // Clear dependent tables first (Phase 8 models + FK children)
  const dependentModels = [
    'ApiMetric',
    'ImportHistory',
    'WarehouseStock',
    'Warehouse',
    'OrderItem',
    'Order',
    'AuditLog',
    'Supplier',
  ];
  for (const modelName of dependentModels) {
    const model = prisma[modelName as keyof typeof prisma] as
      | { deleteMany: () => Promise<unknown> }
      | undefined;
    if (model && 'deleteMany' in model) {
      await model.deleteMany();
      console.log(`Cleared data from ${modelName}`);
    }
  }

  // Clear FK children before parents (sales/purchases before products)
  const deleteOrder = [
    'expenseByCategory',
    'expenses',
    'purchaseSummary',
    'purchases',
    'salesSummary',
    'sales',
    'expenseSummary',
    'users',
    'products',
  ];
  for (const modelName of deleteOrder) {
    const capitalised = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    const model = prisma[capitalised as keyof typeof prisma] as
      | { deleteMany: () => Promise<unknown> }
      | undefined;
    if (model && 'deleteMany' in model) {
      await model.deleteMany();
      console.log(`Cleared data from ${capitalised}`);
    }
  }

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model = prisma[modelName as keyof typeof prisma] as unknown as
      | {
          create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
        }
      | undefined;

    if (!model || !('create' in model)) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    for (const data of jsonData) {
      // Add default password for users if missing
      if (modelName === 'users' && !data.password) {
        data.password = await bcrypt.hash('changeme123', 12);
      }
      await model.create({
        data,
      });
    }

    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
