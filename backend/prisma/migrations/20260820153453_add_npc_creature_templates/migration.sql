-- CreateTable
CREATE TABLE "NpcTemplate" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT,
    "description" TEXT,
    "portraitUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplate" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT,
    "description" TEXT,
    "portraitUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NpcTemplate_systemId_idx" ON "NpcTemplate"("systemId");

-- CreateIndex
CREATE INDEX "NpcTemplate_order_idx" ON "NpcTemplate"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplate_systemId_key_key" ON "NpcTemplate"("systemId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplate_systemId_name_key" ON "NpcTemplate"("systemId", "name");

-- CreateIndex
CREATE INDEX "CreatureTemplate_systemId_idx" ON "CreatureTemplate"("systemId");

-- CreateIndex
CREATE INDEX "CreatureTemplate_order_idx" ON "CreatureTemplate"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplate_systemId_key_key" ON "CreatureTemplate"("systemId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplate_systemId_name_key" ON "CreatureTemplate"("systemId", "name");

-- AddForeignKey
ALTER TABLE "NpcTemplate" ADD CONSTRAINT "NpcTemplate_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplate" ADD CONSTRAINT "CreatureTemplate_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
