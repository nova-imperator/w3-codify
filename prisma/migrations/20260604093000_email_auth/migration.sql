-- Passwordless EMAIL-OTP auth (BUILD_SPEC §6.4, §11).
-- Backfill-safe ordering: fill values BEFORE tightening/loosening constraints
-- so this runs cleanly against the live DB without breaking existing rows/sessions.

-- 1) New onboarding marker; existing users are treated as already onboarded.
ALTER TABLE "User" ADD COLUMN "onboardedAt" TIMESTAMP(3);
UPDATE "User" SET "onboardedAt" = NOW() WHERE "onboardedAt" IS NULL;

-- 2) Email becomes the required identity. Give any legacy null-email rows a
--    stable unique placeholder so the NOT NULL + unique constraint holds.
UPDATE "User" SET "email" = 'legacy+' || "id" || '@users.w3codify.local' WHERE "email" IS NULL;
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- 3) firstName + phone become optional (collected later via onboarding/profile).
ALTER TABLE "User" ALTER COLUMN "firstName" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;

-- 4) OTP requests are now keyed by email.
ALTER TABLE "OtpRequest" RENAME COLUMN "phone" TO "email";
DROP INDEX IF EXISTS "OtpRequest_phone_idx";
CREATE INDEX "OtpRequest_email_idx" ON "OtpRequest"("email");
