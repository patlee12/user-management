/*
  Warnings:

  - A unique constraint covering the columns `[tokenId]` on the table `AccountRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AccountRequest_id_email_key";

-- DropIndex
DROP INDEX "AccountRequest_token_key";

-- AlterTable
ALTER TABLE "AccountRequest" ADD COLUMN     "tokenId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AccountRequest_tokenId_key" ON "AccountRequest"("tokenId");
