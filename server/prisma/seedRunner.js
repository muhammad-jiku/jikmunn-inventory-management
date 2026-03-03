const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const clearOrder = [
    'apiMetric',
    'importHistory',
    'warehouseStock',
    'warehouse',
    'orderItem',
    'order',
    'auditLog',
    'supplier',
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

  for (const m of clearOrder) {
    try {
      await prisma[m].deleteMany();
      console.log('Cleared ' + m);
    } catch (_e) {
      // skip
    }
  }

  const dir = path.join(__dirname, 'seedData');
  const files = [
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

  const hash = await bcrypt.hash('changeme123', 10);

  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    const m = f.replace('.json', '');
    for (const row of data) {
      if (m === 'users' && row.password === undefined) {
        row.password = hash;
      }
      await prisma[m].create({ data: row });
    }
    console.log('Seeded ' + m + ': ' + data.length + ' rows');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
