import { getPlayVisibleFragmentCount, type ViewportKind } from "./fragments";

export type SceneMode = "play" | "read";

export type SceneState = {
  mode: SceneMode;
  visibleFragmentCount: number;
  rallyCount: number;
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  aiPaddleY: number;
  playerPaddleY: number;
};

const MIN_PADDLE_Y = 14;
const MAX_PADDLE_Y = 86;
const PLAYER_PADDLE_STEP = 8;
const PADDLE_REACH = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getInitialSceneState(viewport: ViewportKind = "desktop"): SceneState {
  return {
    mode: "play",
    visibleFragmentCount: getPlayVisibleFragmentCount(viewport),
    rallyCount: 0,
    ballX: 50,
    ballY: 50,
    ballVx: 0.52,
    ballVy: 0.36,
    aiPaddleY: 50,
    playerPaddleY: 50
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

export function movePlayerPaddleByClick(
  state: SceneState,
  normalizedClickY: number
): SceneState {
  const direction = normalizedClickY < 0.5 ? -1 : 1;

  return {
    ...state,
    playerPaddleY: clamp(
      state.playerPaddleY + direction * PLAYER_PADDLE_STEP,
      MIN_PADDLE_Y,
      MAX_PADDLE_Y
    )
  };
}

export function stepPong(state: SceneState): SceneState {
  let ballX = state.ballX + state.ballVx;
  let ballY = state.ballY + state.ballVy;
  let ballVx = state.ballVx;
  let ballVy = state.ballVy;
  const aiPaddleY = clamp(
    state.aiPaddleY + Math.sign(ballY - state.aiPaddleY) * 0.8,
    MIN_PADDLE_Y,
    MAX_PADDLE_Y
  );

  if (ballY <= 4 || ballY >= 96) {
    ballVy *= -1;
    ballY = clamp(ballY, 4, 96);
  }

  const hitsLeftPaddle =
    ballX <= 8 && Math.abs(ballY - aiPaddleY) <= PADDLE_REACH && ballVx < 0;
  const hitsRightPaddle =
    ballX >= 92 && Math.abs(ballY - state.playerPaddleY) <= PADDLE_REACH && ballVx > 0;

  if (hitsLeftPaddle || hitsRightPaddle) {
    ballVx *= -1;
    ballVy += hitsLeftPaddle
      ? (ballY - aiPaddleY) * 0.015
      : (ballY - state.playerPaddleY) * 0.015;
    ballX = clamp(ballX, 8, 92);
  }

  if (ballX < 0 || ballX > 100) {
    return {
      ...state,
      ballX: 50,
      ballY: 50,
      ballVx: ballX < 0 ? 0.52 : -0.52,
      ballVy: 0.36,
      aiPaddleY,
      playerPaddleY: state.playerPaddleY
    };
  }

  return {
    ...state,
    ballX,
    ballY,
    ballVx,
    ballVy,
    aiPaddleY
  };
}
