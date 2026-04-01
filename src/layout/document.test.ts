import { describe, expect, it } from "vitest";
import { paper } from "../content";
import { getInitialSceneState } from "../scene/state";
import {
  buildDocumentLines,
  getBrickLayouts,
  getBodyRegions,
  getPageObstacles,
  getTitleRegion,
  PAGE_COUNT
} from "./document";

describe("document layout", () => {
  it("builds running headers for all pages", () => {
    const lines = buildDocumentLines(paper, getInitialSceneState("desktop"), 900);
    const headerCount = lines.filter((line) =>
      line.className.includes("running-header")
    ).length;

    expect(headerCount).toBe(PAGE_COUNT);
  });

  it("produces page obstacles for the ball and two paddles", () => {
    const obstacles = getPageObstacles(getInitialSceneState("desktop"), 900);
    expect(obstacles.circles).toHaveLength(1);
    expect(obstacles.rects).toHaveLength(2);
  });

  it("creates keyword bricks across the paper stack", () => {
    const bricks = getBrickLayouts(paper);
    expect(bricks.length).toBe(paper.keywords.length);
    expect(bricks[0]?.pageIndex).toBe(0);
  });

  it("defines a dedicated title region on the first page", () => {
    const region = getTitleRegion();
    expect(region.pageIndex).toBe(0);
    expect(region.y).toBeGreaterThan(0);
    expect(region.height).toBeGreaterThan(100);
  });

  it("creates body regions for every page in the stack", () => {
    const regions = getBodyRegions();
    expect(regions).toHaveLength(PAGE_COUNT);
    expect(regions[0]?.pageIndex).toBe(0);
    expect(regions[1]?.pageIndex).toBe(1);
  });
});
