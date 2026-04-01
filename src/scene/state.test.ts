import { describe, expect, it } from "vitest";
import { applyClickRally, getInitialSceneState, toggleMode } from "./state";

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
});
