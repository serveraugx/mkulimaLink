-- CreateEnum
CREATE TYPE "BuyerMessageRole" AS ENUM ('BUYER', 'MKULIMA');

-- CreateTable
CREATE TABLE "buyer_ai_messages" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "crop" "CropType" NOT NULL,
    "role" "BuyerMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buyer_ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "buyer_ai_messages_buyerId_crop_createdAt_idx" ON "buyer_ai_messages"("buyerId", "crop", "createdAt");

-- AddForeignKey
ALTER TABLE "buyer_ai_messages" ADD CONSTRAINT "buyer_ai_messages_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
