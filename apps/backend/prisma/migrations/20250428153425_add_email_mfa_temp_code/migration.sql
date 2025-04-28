-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailMfaTempCode" TEXT,
ADD COLUMN     "emailMfaTempExpiresAt" TIMESTAMP(3);
