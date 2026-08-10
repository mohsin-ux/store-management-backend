/*
  Warnings:

  - A unique constraint covering the columns `[storeId,isOwner]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "storeId" TEXT;

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_storeId_isOwner_key" ON "users"("storeId", "isOwner");
