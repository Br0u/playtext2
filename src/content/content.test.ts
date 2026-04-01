import { describe, expect, it } from "vitest";
import { paper } from "./index";

describe("paper dataset", () => {
  it("uses the required source paper", () => {
    expect(paper.title).toBe("Attention Is All You Need");
    expect(paper.sourceUrl).toContain("1706.03762");
  });

  it("provides the minimum interactive content inventory", () => {
    expect(paper.excerpts.length).toBeGreaterThanOrEqual(3);
    expect(paper.keywords.length).toBeGreaterThanOrEqual(4);
  });
});
