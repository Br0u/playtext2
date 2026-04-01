import { useEffect, useMemo, useState } from "react";
import type { PaperContent } from "../content";
import {
  buildDocumentLines,
  getBrickLayouts,
  PAGE_COUNT
} from "../layout/document";
import {
  applyClickRally,
  getInitialSceneState,
  stepPong,
  toggleMode,
  type SceneState
} from "../scene/state";

type SceneProps = {
  paper: PaperContent;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getViewportWidth() {
  return typeof window === "undefined" ? 1280 : window.innerWidth;
}

function getViewportHeight() {
  return typeof window === "undefined" ? 900 : window.innerHeight;
}

export function Scene({ paper }: SceneProps) {
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const [viewportHeight, setViewportHeight] = useState(getViewportHeight);
  const [sceneState, setSceneState] = useState(() => getInitialSceneState("desktop"));
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [rightPaddleMode, setRightPaddleMode] = useState<"ai" | "user">("ai");
  const [pointerY, setPointerY] = useState(50);

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(getViewportWidth());
      setViewportHeight(getViewportHeight());
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setRightPaddleMode("ai");
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        setSceneState((current) => toggleMode(current));
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSceneState((current) => {
        const targetPlayerY =
          rightPaddleMode === "user"
            ? pointerY
            : clamp(current.playerPaddleY + Math.sign(current.ballY - current.playerPaddleY) * 1.1, 14, 86);
        const withTarget = {
          ...current,
          playerPaddleY: targetPlayerY
        };

        if (withTarget.ballX <= 1.5) {
          setScore((scoreState) => ({ ...scoreState, right: scoreState.right + 1 }));
        } else if (withTarget.ballX >= 98.5) {
          setScore((scoreState) => ({ ...scoreState, left: scoreState.left + 1 }));
        }

        return stepPong(withTarget);
      });
    }, 16);

    return () => window.clearInterval(intervalId);
  }, [pointerY, rightPaddleMode]);

  const lines = useMemo(
    () => buildDocumentLines(paper, sceneState, viewportHeight),
    [paper, sceneState, viewportHeight]
  );

  const bricks = useMemo(() => getBrickLayouts(paper), [paper]);

  const handlePointerDown: React.PointerEventHandler<HTMLElement> = (event) => {
    setRightPaddleMode("user");
    setPointerY((event.clientY / window.innerHeight) * 100);
    setSceneState((current) => applyClickRally(current, "desktop"));
  };

  const handlePointerMove: React.PointerEventHandler<HTMLElement> = (event) => {
    if (rightPaddleMode === "user") {
      setPointerY((event.clientY / window.innerHeight) * 100);
    }
  };

  const scoreLabel = `${String(score.left).padStart(2, "0")} : ${String(score.right).padStart(2, "0")}`;

  return (
    <div className="paper-pong-root" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}>
      <div className="desk-noise" aria-hidden="true" />

      <div className="hud">
        <div className="scoreboard">
          <span className="scoreboard-label">Paper Pong</span>
          <span className="scoreboard-score">{scoreLabel}</span>
        </div>
        <p className="scoreboard-note">
          Click to control the right paddle. Press Esc to return it to AI.
        </p>
        <div aria-label="left paddle" className="paddle" style={{ transform: `translate3d(28px, calc(${sceneState.aiPaddleY}vh - 59px), 0)` }} />
        <div aria-label="right paddle" className="paddle" style={{ transform: `translate3d(calc(100vw - 40px), calc(${sceneState.playerPaddleY}vh - 59px), 0)` }} />
        <div aria-label="bottom paddle" className="paddle paddle--bottom" style={{ display: "none" }} />
        <div aria-label="pong ball" className="ball" style={{ transform: `translate3d(calc(${sceneState.ballX}vw - 13px), calc(${sceneState.ballY}vh - 13px), 0)` }} />
      </div>

      <main className="document-stack">
        {Array.from({ length: PAGE_COUNT }, (_, pageIndex) => (
          <article
            key={pageIndex}
            aria-label={`paper sheet ${pageIndex + 1}`}
            className="paper-sheet"
          >
            <div className="paper-stage">
              {lines
                .filter((line) => line.pageIndex === pageIndex)
                .map((line, index) => (
                  <div
                    key={`${pageIndex}-${index}-${line.y}`}
                    className={line.className}
                    style={{
                      left: `${line.x}px`,
                      top: `${line.y}px`,
                      width: line.width ? `${Math.ceil(line.width)}px` : undefined
                    }}
                  >
                    {line.text}
                  </div>
                ))}
              {bricks
                .filter((brick) => brick.pageIndex === pageIndex)
                .map((brick, index) => (
                  <div
                    key={`${brick.text}-${index}`}
                    className="text-brick"
                    data-strength={brick.strength}
                    data-remaining={brick.strength}
                    style={{
                      left: `${brick.x}px`,
                      top: `${brick.y}px`
                    }}
                  >
                    {brick.text}
                  </div>
                ))}
            </div>
            <div className="page-number">{pageIndex + 1}</div>
          </article>
        ))}
      </main>
    </div>
  );
}
