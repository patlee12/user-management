/*
  Warnings:

  - Changed the type of `actionType` on the `Permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `resource` on the `Permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "actionType",
ADD COLUMN     "actionType" "ActionType" NOT NULL,
DROP COLUMN "resource",
ADD COLUMN     "resource" "Resource" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_actionType_resource_key" ON "Permission"("actionType", "resource");
