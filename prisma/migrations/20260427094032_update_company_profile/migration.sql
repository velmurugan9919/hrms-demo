/*
  Warnings:

  - You are about to drop the column `phone` on the `CompanyProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyProfile" DROP COLUMN "phone",
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "landline" TEXT,
ADD COLUMN     "mobile" TEXT;
