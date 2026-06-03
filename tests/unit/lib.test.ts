import { describe, it, expect } from "vitest";
import {
  generateOtp,
  hashOtp,
  safeEqualHex,
  normalizePhone,
  isValidPhone,
  OTP_LENGTH,
} from "@/lib/otp";
import { pricingFor, LAUNCH_ANCHOR_INR } from "@/lib/pricing";
import { slugify, formatDuration, discountPercent, formatINR } from "@/lib/utils";

describe("otp", () => {
  it("generates a 6-digit numeric code", () => {
    for (let i = 0; i < 50; i++) {
      const c = generateOtp();
      expect(c).toMatch(/^\d{6}$/);
      expect(c).toHaveLength(OTP_LENGTH);
    }
  });

  it("hashes deterministically and verifies with timing-safe compare", () => {
    const a = hashOtp("9876543210", "123456");
    const b = hashOtp("9876543210", "123456");
    expect(a).toBe(b);
    expect(safeEqualHex(a, b)).toBe(true);
    expect(safeEqualHex(a, hashOtp("9876543210", "654321"))).toBe(false);
  });

  it("normalizes Indian phone numbers", () => {
    expect(normalizePhone("+91 98765 43210")).toBe("9876543210");
    expect(normalizePhone("919876543210")).toBe("9876543210");
    expect(normalizePhone("98765-43210")).toBe("9876543210");
  });

  it("validates 10-digit numbers", () => {
    expect(isValidPhone("9876543210")).toBe(true);
    expect(isValidPhone("12345")).toBe(false);
    expect(isValidPhone("98765432100")).toBe(false);
  });
});

describe("pricing", () => {
  it("treats price 0 as the free launch offer with a ₹10,000 anchor", () => {
    const p = pricingFor(0, 49999);
    expect(p.free).toBe(true);
    expect(p.launchOffer).toBe(true);
    expect(p.anchorInr).toBe(LAUNCH_ANCHOR_INR);
  });

  it("treats a real price as paid with the MRP anchor", () => {
    const p = pricingFor(24999, 49999);
    expect(p.free).toBe(false);
    expect(p.launchOffer).toBe(false);
    expect(p.anchorInr).toBe(49999);
  });
});

describe("utils", () => {
  it("slugifies titles", () => {
    expect(slugify("Machine Learning & Deep Learning")).toBe("machine-learning-deep-learning");
    expect(slugify("  Cloud  Computing!! ")).toBe("cloud-computing");
  });

  it("formats durations", () => {
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(90)).toBe("2m");
    expect(formatDuration(3600)).toBe("1h");
    expect(formatDuration(3600 + 30 * 60)).toBe("1h 30m");
  });

  it("computes discount percent", () => {
    expect(discountPercent(24999, 49999)).toBe(50);
    expect(discountPercent(0, 0)).toBe(0);
    expect(discountPercent(100, 50)).toBe(0);
  });

  it("formats INR currency", () => {
    expect(formatINR(10000)).toContain("10,000");
  });
});
