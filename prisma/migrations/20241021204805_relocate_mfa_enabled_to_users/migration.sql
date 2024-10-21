/*
  Warnings:

  - You are about to drop the column `enabled` on the `mfa_auth` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "mfa_auth" DROP COLUMN "enabled";
