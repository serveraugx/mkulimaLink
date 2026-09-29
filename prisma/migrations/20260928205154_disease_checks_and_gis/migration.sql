-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('NONE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "disease_checks" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "remediation" TEXT[],
    "rawAssessment" TEXT NOT NULL,
    "imageHash" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disease_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "disease_checks_farmId_checkedAt_idx" ON "disease_checks"("farmId", "checkedAt");

-- AddForeignKey
ALTER TABLE "disease_checks" ADD CONSTRAINT "disease_checks_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
