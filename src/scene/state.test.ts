import { describe, expect, it } from "vitest";
import {
  applyClickRally,
  getInitialSceneState,
  movePlayerPaddleByClick,
  toggleMode
} from "./state";

describe("getInitialSceneState", () => {
  it("starts in play mode", () => {
    expect(getInitialSceneState().mode).toBe("play");
  });

  it("toggles to read mode", () => {
    expect(toggleMode(getInitialSceneState()).mode).toBe("read");
  });

  it("reveals at most one fragment per desktop click rally", () => {
    const next = applyClickRally(getInitialSceneState(), "desktop");
    expect(next.visibleFragmentCount).toBe(5);
  });

  it("moves the player paddle upward in fixed steps when the upper half is clicked", () => {
    const next = movePlayerPaddleByClick(getInitialSceneState(), 0.2);
    expect(next.playerPaddleY).toBeLessThan(getInitialSceneState().playerPaddleY);
  });

  it("moves the player paddle downward in fixed steps when the lower half is clicked", () => {
    const next = movePlayerPaddleByClick(getInitialSceneState(), 0.8);
    expect(next.playerPaddleY).toBeGreaterThan(getInitialSceneState().playerPaddleY);
  });
});
