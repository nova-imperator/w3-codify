-- AlterTable
ALTER TABLE "User" ADD COLUMN     "college" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "degree" TEXT,
ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "gradYear" INTEGER,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "websiteUrl" TEXT;
