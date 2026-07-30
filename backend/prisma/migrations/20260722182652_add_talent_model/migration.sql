-- CreateTable
CREATE TABLE "Talent" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
    "prerequisites" JSONB NOT NULL DEFAULT '{}',
    "attributeBonuses" JSONB NOT NULL DEFAULT '{}',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Talent_systemId_idx" ON "Talent"("systemId");

-- CreateIndex
CREATE INDEX "Talent_order_idx" ON "Talent"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Talent_systemId_key_key" ON "Talent"("systemId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Talent_systemId_name_key" ON "Talent"("systemId", "name");

-- AddForeignKey
ALTER TABLE "Talent" ADD CONSTRAINT "Talent_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
