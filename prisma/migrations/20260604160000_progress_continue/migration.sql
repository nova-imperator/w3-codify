-- Learning progress %, resume, and streaks (FEATURE_progress-continue).
-- Purely additive nullable columns + defaults — safe on the live DB.
ALTER TABLE "Enrollment" ADD COLUMN "lastLessonId" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "lastActiveAt" TIMESTAMP(3);

ALTER TABLE "User" ADD COLUMN "streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastActiveDate" TIMESTAMP(3);
