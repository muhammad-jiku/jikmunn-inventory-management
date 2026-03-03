/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `tblusers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `tblexpensebycategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tblexpenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tblexpensesummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tblproducts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tblpurchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tblpurchasesummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tblsales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tblsalessummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `tblusers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tblusers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tblexpensebycategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tblexpenses" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tblexpensesummary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tblproducts" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tblpurchases" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tblpurchasesummary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tblsales" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tblsalessummary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tblusers" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'viewer',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "tblexpensebycategory_category_idx" ON "tblexpensebycategory"("category");

-- CreateIndex
CREATE INDEX "tblexpensebycategory_expenseSummaryId_idx" ON "tblexpensebycategory"("expenseSummaryId");

-- CreateIndex
CREATE INDEX "tblexpenses_category_idx" ON "tblexpenses"("category");

-- CreateIndex
CREATE INDEX "tblexpenses_timestamp_idx" ON "tblexpenses"("timestamp");

-- CreateIndex
CREATE INDEX "tblproducts_name_idx" ON "tblproducts"("name");

-- CreateIndex
CREATE INDEX "tblpurchases_productId_idx" ON "tblpurchases"("productId");

-- CreateIndex
CREATE INDEX "tblpurchases_timestamp_idx" ON "tblpurchases"("timestamp");

-- CreateIndex
CREATE INDEX "tblsales_productId_idx" ON "tblsales"("productId");

-- CreateIndex
CREATE INDEX "tblsales_timestamp_idx" ON "tblsales"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "tblusers_email_key" ON "tblusers"("email");

-- CreateIndex
CREATE INDEX "tblusers_email_idx" ON "tblusers"("email");
