-- CreateEnum
CREATE TYPE "AlertDirection" AS ENUM ('BELOW', 'ABOVE');

-- CreateTable
CREATE TABLE "price_alerts" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "crop" "CropType" NOT NULL,
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "direction" "AlertDirection" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_alerts_buyerId_idx" ON "price_alerts"("buyerId");

-- AddForeignKey
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
