/*
  Warnings:

  - A unique constraint covering the columns `[name,actionType]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actionType` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permission_name_key";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "actionType" TEXT NOT NULL,
ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "resource" TEXT,
ADD COLUMN     "updatedBy" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_actionType_key" ON "Permission"("name", "actionType");
