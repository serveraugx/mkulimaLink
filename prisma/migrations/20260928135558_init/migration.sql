-- CreateEnum
CREATE TYPE "CropType" AS ENUM ('MAIZE', 'RICE', 'CASSAVA', 'BEANS', 'TOMATO');

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('WFP', 'RATIN', 'SAMPLE');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('FARMER', 'MKULIMA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "sizeHectares" DOUBLE PRECISION NOT NULL,
    "crop" "CropType" NOT NULL,
    "plantingDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_calendar_stages" (
    "id" TEXT NOT NULL,
    "crop" "CropType" NOT NULL,
    "stage" TEXT NOT NULL,
    "daysFromSow" INTEGER NOT NULL,
    "daysToNext" INTEGER,

    CONSTRAINT "crop_calendar_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_prices" (
    "id" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "commodity" "CropType" NOT NULL,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "priceType" TEXT NOT NULL DEFAULT 'retail',
    "date" TIMESTAMP(3) NOT NULL,
    "source" "PriceSource" NOT NULL DEFAULT 'SAMPLE',

    CONSTRAINT "market_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "farms_ownerId_idx" ON "farms"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "crop_calendar_stages_crop_stage_key" ON "crop_calendar_stages"("crop", "stage");

-- CreateIndex
CREATE INDEX "market_prices_commodity_date_idx" ON "market_prices"("commodity", "date");

-- CreateIndex
CREATE INDEX "ai_messages_farmId_createdAt_idx" ON "ai_messages"("farmId", "createdAt");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
