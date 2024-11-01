/*
  Warnings:

  - Made the column `description` on table `Permission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdBy` on table `Permission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `resource` on table `Permission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedBy` on table `Permission` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE', 'APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "Resource" AS ENUM ('POSTS', 'ROLES', 'PERMISSIONS', 'USERS');

-- AlterTable
ALTER TABLE "Permission" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "createdBy" SET NOT NULL,
ALTER COLUMN "resource" SET NOT NULL,
ALTER COLUMN "updatedBy" SET NOT NULL;
