import { describe, expect, it } from "vitest";
import { getReadColumnCount, hasMarginNotes } from "./columns";
import { getParagraphLayoutWidth, getParagraphOffset } from "./pretext";

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

  it("narrows paragraph layout when the ball is close to the paragraph", () => {
    expect(
      getParagraphLayoutWidth({
        baseWidth: 520,
        paragraphCenterY: 50,
        ballY: 52
      })
    ).toBeLessThan(520);
  });

  it("keeps paragraph layout width unchanged when the ball is far away", () => {
    expect(
      getParagraphLayoutWidth({
        baseWidth: 520,
        paragraphCenterY: 15,
        ballY: 85
      })
    ).toBe(520);
  });

  it("pushes the paragraph away from the ball horizontally", () => {
    expect(
      getParagraphOffset({
        paragraphCenterY: 50,
        ballX: 62,
        ballY: 50
      })
    ).toBeLessThan(0);
  });
});
