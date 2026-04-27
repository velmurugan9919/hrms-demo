/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `LeaveRequest` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `LeaveRequest` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeaveRequestStatus" ADD VALUE 'TL_APPROVED';
ALTER TYPE "LeaveRequestStatus" ADD VALUE 'MANAGER_APPROVED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'TEAM_LEADER';
ALTER TYPE "Role" ADD VALUE 'MANAGER';
ALTER TYPE "Role" ADD VALUE 'HR';

-- AlterTable
ALTER TABLE "LeaveRequest" DROP COLUMN "approvedAt",
DROP COLUMN "approvedBy",
ADD COLUMN     "hrApprovedAt" TIMESTAMP(3),
ADD COLUMN     "hrApprovedBy" TEXT,
ADD COLUMN     "hrRemarks" TEXT,
ADD COLUMN     "hrStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "managerApprovedAt" TIMESTAMP(3),
ADD COLUMN     "managerApprovedBy" TEXT,
ADD COLUMN     "managerRemarks" TEXT,
ADD COLUMN     "managerStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "teamLeaderApprovedAt" TIMESTAMP(3),
ADD COLUMN     "teamLeaderApprovedBy" TEXT,
ADD COLUMN     "teamLeaderRemarks" TEXT,
ADD COLUMN     "teamLeaderStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';
