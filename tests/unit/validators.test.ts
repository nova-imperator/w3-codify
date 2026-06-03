import { describe, it, expect } from "vitest";
import { coursesQuerySchema } from "@/server/validators";
import { verifyRecaptcha } from "@/lib/recaptcha";

describe("coursesQuerySchema", () => {
  it("accepts valid filters", () => {
    const r = coursesQuerySchema.safeParse({ tag: "GenAI", level: "ADVANCED", q: "ml" });
    expect(r.success).toBe(true);
  });

  it("accepts an empty query", () => {
    expect(coursesQuerySchema.safeParse({}).success).toBe(true);
  });

  it("rejects an invalid level", () => {
    const r = coursesQuerySchema.safeParse({ level: "WIZARD" });
    expect(r.success).toBe(false);
  });
});

describe("recaptcha", () => {
  it("skips verification (allows) when unconfigured", async () => {
    delete process.env.RECAPTCHA_SECRET_KEY;
    delete process.env.RECAPTCHA_SITE_KEY;
    await expect(verifyRecaptcha(undefined)).resolves.toBe(true);
  });
});
