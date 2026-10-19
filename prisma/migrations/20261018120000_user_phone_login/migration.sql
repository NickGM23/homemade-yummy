-- DropIndex
DROP INDEX "User_fullName_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

