-- Admin-toggleable feature flags (feature-flags feature).
-- Additive + standalone: a new table keyed by the flag's string key. A missing
-- row means "use the code default" (src/server/flags.ts), so this is safe to
-- deploy before the seed runs.

CREATE TABLE "FeatureFlag" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key")
);
