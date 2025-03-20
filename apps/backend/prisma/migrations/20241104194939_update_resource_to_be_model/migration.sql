/*
  Warnings:

  - You are about to drop the column `resource` on the `Permission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[actionType,resourceId]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resourceId` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Role` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `assignedBy` to the `UserRoles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permission_actionType_resource_key";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "resource",
ADD COLUMN     "resourceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "createdBy" INTEGER NOT NULL,
ADD COLUMN     "updatedBy" INTEGER NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserRoles" ADD COLUMN     "assignedBy" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "Resource";

-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resource_name_key" ON "Resource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_actionType_resourceId_key" ON "Permission"("actionType", "resourceId");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
