/*
  Warnings:

  - You are about to drop the column `isOwner` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_storeId_isOwner_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isOwner";
