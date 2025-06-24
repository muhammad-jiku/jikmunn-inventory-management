-- CreateTable
CREATE TABLE "tblusers" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "tblusers_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "tblproducts" (
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION,
    "stockQuantity" INTEGER NOT NULL,

    CONSTRAINT "tblproducts_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "tblsales" (
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "tblsales_pkey" PRIMARY KEY ("saleId")
);

-- CreateTable
CREATE TABLE "tblpurchases" (
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "tblpurchases_pkey" PRIMARY KEY ("purchaseId")
);

-- CreateTable
CREATE TABLE "tblexpenses" (
    "expenseId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblexpenses_pkey" PRIMARY KEY ("expenseId")
);

-- CreateTable
CREATE TABLE "tblsalessummary" (
    "salesSummaryId" TEXT NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "changePercentage" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblsalessummary_pkey" PRIMARY KEY ("salesSummaryId")
);

-- CreateTable
CREATE TABLE "tblpurchasesummary" (
    "purchaseSummaryId" TEXT NOT NULL,
    "totalPurchased" DOUBLE PRECISION NOT NULL,
    "changePercentage" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblpurchasesummary_pkey" PRIMARY KEY ("purchaseSummaryId")
);

-- CreateTable
CREATE TABLE "tblexpensesummary" (
    "expenseSummaryId" TEXT NOT NULL,
    "totalExpenses" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblexpensesummary_pkey" PRIMARY KEY ("expenseSummaryId")
);

-- CreateTable
CREATE TABLE "tblexpensebycategory" (
    "expenseByCategoryId" TEXT NOT NULL,
    "expenseSummaryId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblexpensebycategory_pkey" PRIMARY KEY ("expenseByCategoryId")
);

-- AddForeignKey
ALTER TABLE "tblsales" ADD CONSTRAINT "tblsales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tblproducts"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblpurchases" ADD CONSTRAINT "tblpurchases_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tblproducts"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblexpensebycategory" ADD CONSTRAINT "tblexpensebycategory_expenseSummaryId_fkey" FOREIGN KEY ("expenseSummaryId") REFERENCES "tblexpensesummary"("expenseSummaryId") ON DELETE RESTRICT ON UPDATE CASCADE;
