-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('local', 'oauth');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "loginType" "LoginType" NOT NULL DEFAULT 'local';
