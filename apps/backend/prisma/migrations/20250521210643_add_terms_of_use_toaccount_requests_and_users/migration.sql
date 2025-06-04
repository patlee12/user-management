/*
  Warnings:

  - Added the required column `acceptedTermsAt` to the `AccountRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termsVersion` to the `AccountRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccountRequest" ADD COLUMN     "acceptedTermsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "termsVersion" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "acceptedTermsAt" TIMESTAMP(3),
ADD COLUMN     "termsVersion" TEXT;
