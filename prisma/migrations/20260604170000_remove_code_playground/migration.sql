-- Remove the Code Playground feature.
--
-- Drops the CodeSubmission table (only held playground/exercise submissions).
-- NOTE: the BlockType enum value 'CODE_EXERCISE' is intentionally KEPT — Postgres
-- can't easily drop an enum value, and leaving an unused value is harmless. Old
-- CODE_EXERCISE lesson blocks now render as static, read-only code snippets.

-- DropTable
DROP TABLE IF EXISTS "CodeSubmission" CASCADE;
