/*
  Warnings:

  - You are about to drop the column `branch` on the `Repository` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Repository" DROP COLUMN "branch",
ADD COLUMN     "defaultBranch" TEXT NOT NULL DEFAULT 'main';
