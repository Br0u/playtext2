import { describe, expect, it } from "vitest";
import { paper } from "./index";

describe("paper dataset", () => {
  it("uses the required source paper", () => {
    expect(paper.title).toBe(
      "ImageNet Classification with Deep Convolutional Neural Networks"
    );
    expect(paper.sourceUrl).toContain("papers.nips.cc");
  });

  it("provides the minimum interactive content inventory", () => {
    expect(paper.excerpts.length).toBeGreaterThanOrEqual(3);
    expect(paper.keywords.length).toBeGreaterThanOrEqual(4);
  });
});
