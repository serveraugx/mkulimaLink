-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FARMER', 'BUYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatElement" AS ENUM ('PRODUCTION', 'YIELD', 'AREA_HARVESTED');

-- AlterTable
ALTER TABLE "market_prices" ALTER COLUMN "source" SET DEFAULT 'WFP';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'FARMER';

-- CreateTable
CREATE TABLE "national_crop_stats" (
    "id" TEXT NOT NULL,
    "crop" "CropType" NOT NULL,
    "year" INTEGER NOT NULL,
    "element" "StatElement" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "national_crop_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "national_crop_stats_crop_year_element_key" ON "national_crop_stats"("crop", "year", "element");
