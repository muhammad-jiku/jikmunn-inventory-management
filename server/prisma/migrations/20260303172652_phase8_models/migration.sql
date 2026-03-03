/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `tblproducts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tblproducts" ADD COLUMN     "barcode" TEXT;

-- AlterTable
ALTER TABLE "tblpurchases" ADD COLUMN     "supplierId" TEXT;

-- CreateTable
CREATE TABLE "tblauditlog" (
    "auditLogId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblauditlog_pkey" PRIMARY KEY ("auditLogId")
);

-- CreateTable
CREATE TABLE "tblsuppliers" (
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblsuppliers_pkey" PRIMARY KEY ("supplierId")
);

-- CreateTable
CREATE TABLE "tblorders" (
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblorders_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "tblorderitems" (
    "orderItemId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblorderitems_pkey" PRIMARY KEY ("orderItemId")
);

-- CreateTable
CREATE TABLE "tblwarehouses" (
    "warehouseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblwarehouses_pkey" PRIMARY KEY ("warehouseId")
);

-- CreateTable
CREATE TABLE "tblwarehousestock" (
    "warehouseStockId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblwarehousestock_pkey" PRIMARY KEY ("warehouseStockId")
);

-- CreateTable
CREATE TABLE "tblimporthistory" (
    "importId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "successful" INTEGER NOT NULL,
    "failed" INTEGER NOT NULL,
    "errors" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblimporthistory_pkey" PRIMARY KEY ("importId")
);

-- CreateTable
CREATE TABLE "tblapimetrics" (
    "metricId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblapimetrics_pkey" PRIMARY KEY ("metricId")
);

-- CreateIndex
CREATE INDEX "tblauditlog_userId_idx" ON "tblauditlog"("userId");

-- CreateIndex
CREATE INDEX "tblauditlog_entity_entityId_idx" ON "tblauditlog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "tblauditlog_createdAt_idx" ON "tblauditlog"("createdAt");

-- CreateIndex
CREATE INDEX "tblsuppliers_name_idx" ON "tblsuppliers"("name");

-- CreateIndex
CREATE INDEX "tblorders_status_idx" ON "tblorders"("status");

-- CreateIndex
CREATE INDEX "tblorders_createdAt_idx" ON "tblorders"("createdAt");

-- CreateIndex
CREATE INDEX "tblorderitems_orderId_idx" ON "tblorderitems"("orderId");

-- CreateIndex
CREATE INDEX "tblorderitems_productId_idx" ON "tblorderitems"("productId");

-- CreateIndex
CREATE INDEX "tblwarehouses_name_idx" ON "tblwarehouses"("name");

-- CreateIndex
CREATE INDEX "tblwarehousestock_warehouseId_idx" ON "tblwarehousestock"("warehouseId");

-- CreateIndex
CREATE INDEX "tblwarehousestock_productId_idx" ON "tblwarehousestock"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "tblwarehousestock_warehouseId_productId_key" ON "tblwarehousestock"("warehouseId", "productId");

-- CreateIndex
CREATE INDEX "tblimporthistory_createdAt_idx" ON "tblimporthistory"("createdAt");

-- CreateIndex
CREATE INDEX "tblapimetrics_endpoint_idx" ON "tblapimetrics"("endpoint");

-- CreateIndex
CREATE INDEX "tblapimetrics_createdAt_idx" ON "tblapimetrics"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tblproducts_barcode_key" ON "tblproducts"("barcode");

-- CreateIndex
CREATE INDEX "tblproducts_barcode_idx" ON "tblproducts"("barcode");

-- CreateIndex
CREATE INDEX "tblpurchases_supplierId_idx" ON "tblpurchases"("supplierId");

-- AddForeignKey
ALTER TABLE "tblpurchases" ADD CONSTRAINT "tblpurchases_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "tblsuppliers"("supplierId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblauditlog" ADD CONSTRAINT "tblauditlog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tblusers"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblorderitems" ADD CONSTRAINT "tblorderitems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "tblorders"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblorderitems" ADD CONSTRAINT "tblorderitems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tblproducts"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblwarehousestock" ADD CONSTRAINT "tblwarehousestock_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "tblwarehouses"("warehouseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblwarehousestock" ADD CONSTRAINT "tblwarehousestock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tblproducts"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
