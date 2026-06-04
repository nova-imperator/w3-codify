-- Gender for default profile avatars (gender-avatar feature).
-- Additive + backfill-safe: a new enum and a new column that defaults to
-- UNSPECIFIED, so every existing row stays valid and keeps the current neutral
-- (initials) fallback until the user picks a gender.

CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNSPECIFIED');

ALTER TABLE "User" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'UNSPECIFIED';
