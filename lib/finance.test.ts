// file: lib/finance.test.ts
import { describe, it, expect } from "vitest";
import { toMinorUnits, fromMinorUnits, formatMoney } from "./finance";

describe("Financial Calculations", () => {
  it("converts decimal amounts to minor units correctly", () => {
    expect(toMinorUnits(100.50)).toBe(10050);
    expect(toMinorUnits(0)).toBe(0);
    expect(toMinorUnits(99.99)).toBe(9999);
  });

  it("handles the JavaScript floating point math problem safely", () => {
    // 0.1 + 0.2 in standard JS equals 0.30000000000000004
    // We want to ensure our toMinorUnits function rounds it cleanly.
    const trickyMath = 0.1 + 0.2;
    expect(toMinorUnits(trickyMath)).toBe(30);
  });

  it("converts minor units back to decimal correctly", () => {
    expect(fromMinorUnits(10050)).toBe(100.5);
    expect(fromMinorUnits(30)).toBe(0.3);
    expect(fromMinorUnits(0)).toBe(0);
  });

  it("formats money correctly using standard locale", () => {
    // 10050 minor units = 100.50 BDT
    expect(formatMoney(10050)).toBe("৳100.50");
    // Whole amounts do not render trailing .00
    expect(formatMoney(762200)).toBe("৳7,622");
    // Fractional amounts render 2 decimals
    expect(formatMoney(4403)).toBe("৳44.03");
  });
});