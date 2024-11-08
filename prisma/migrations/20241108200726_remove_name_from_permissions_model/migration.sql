/*
  Warnings:

  - You are about to drop the column `name` on the `Permission` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Permission_name_key";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "name";
