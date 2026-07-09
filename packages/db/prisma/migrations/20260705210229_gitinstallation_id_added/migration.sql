/*
  Warnings:

  - A unique constraint covering the columns `[provider,owner,name]` on the table `Repository` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,providerRepoId]` on the table `Repository` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gitInstallationId` to the `Repository` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `Repository` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `Repository` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerRepoId` to the `Repository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "gitInstallationId" INTEGER NOT NULL,
ADD COLUMN     "owner" TEXT NOT NULL,
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "providerRepoId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Repository_provider_owner_name_key" ON "Repository"("provider", "owner", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_provider_providerRepoId_key" ON "Repository"("provider", "providerRepoId");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_gitInstallationId_fkey" FOREIGN KEY ("gitInstallationId") REFERENCES "GitInstallation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
