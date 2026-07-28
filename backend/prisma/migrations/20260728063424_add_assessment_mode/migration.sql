-- CreateEnum
CREATE TYPE "AssessmentMode" AS ENUM ('practice', 'exam');

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "assessmentMode" "AssessmentMode" NOT NULL DEFAULT 'practice';
