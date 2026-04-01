import { describe, expect, it } from "vitest";
import { getReadColumnCount, hasMarginNotes } from "./columns";

describe("layout rules", () => {
  it("uses one column on mobile", () => {
    expect(getReadColumnCount(375)).toBe(1);
  });

  it("uses two columns on wide desktop", () => {
    expect(getReadColumnCount(1280)).toBe(2);
  });

  it("enables margin notes only when the viewport is wide enough", () => {
    expect(hasMarginNotes(768)).toBe(false);
    expect(hasMarginNotes(1280)).toBe(true);
  });
});
