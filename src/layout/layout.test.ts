import { describe, expect, it } from "vitest";
import { getReadColumnCount, hasMarginNotes } from "./columns";
import {
  carveTextLineSlots,
  circleIntervalForBand,
  getParagraphLayoutWidth,
  getParagraphOffset,
  rectIntervalForBand
} from "./pretext";

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

  it("carves blocked intervals into usable slots", () => {
    expect(
      carveTextLineSlots(
        { left: 0, right: 240 },
        [{ left: 90, right: 150 }]
      )
    ).toEqual([
      { left: 0, right: 90 },
      { left: 150, right: 240 }
    ]);
  });

  it("creates a circle interval when the band intersects the ball", () => {
    const interval = circleIntervalForBand(
      { cx: 50, cy: 50, r: 10, hPad: 4, vPad: 0 },
      46,
      54
    );
    expect(interval).not.toBeNull();
    expect(interval!.left).toBeLessThan(50);
    expect(interval!.right).toBeGreaterThan(50);
  });

  it("creates a rect interval when the band crosses a rect obstacle", () => {
    expect(
      rectIntervalForBand(
        { x: 20, y: 30, w: 40, h: 20, hPad: 5, vPad: 0 },
        35,
        45
      )
    ).toEqual({ left: 15, right: 65 });
  });
});
