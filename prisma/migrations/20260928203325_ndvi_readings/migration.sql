-- CreateTable
CREATE TABLE "ndvi_readings" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "meanNdvi" DOUBLE PRECISION NOT NULL,
    "minNdvi" DOUBLE PRECISION NOT NULL,
    "maxNdvi" DOUBLE PRECISION NOT NULL,
    "validPixelPercent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ndvi_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ndvi_readings_farmId_createdAt_idx" ON "ndvi_readings"("farmId", "createdAt");

-- AddForeignKey
ALTER TABLE "ndvi_readings" ADD CONSTRAINT "ndvi_readings_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
