import { getPlayVisibleFragmentCount, type ViewportKind } from "./fragments";

export type SceneMode = "play" | "read";

export type SceneState = {
  mode: SceneMode;
  visibleFragmentCount: number;
  rallyCount: number;
};

export function getInitialSceneState(viewport: ViewportKind = "desktop"): SceneState {
  return {
    mode: "play",
    visibleFragmentCount: getPlayVisibleFragmentCount(viewport),
    rallyCount: 0
  };
}

export function toggleMode(state: SceneState): SceneState {
  return {
    ...state,
    mode: state.mode === "play" ? "read" : "play"
  };
}

export function applyClickRally(state: SceneState, viewport: ViewportKind): SceneState {
  const maxVisible = getPlayVisibleFragmentCount(viewport) + 1;

  return {
    ...state,
    visibleFragmentCount: Math.min(state.visibleFragmentCount + 1, maxVisible),
    rallyCount: state.rallyCount + 1
  };
}
