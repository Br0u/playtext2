import { useEffect, useState } from "react";
import type { PaperContent } from "../content";
import { hasMarginNotes } from "../layout/columns";
import {
  getInitialVisibleFragments,
  getVisibleKeywords,
  getViewportKind,
} from "../scene/fragments";
import {
  applyClickRally,
  getInitialSceneState,
  movePlayerPaddleByClick,
  stepPong,
  toggleMode
} from "../scene/state";
import { Marginalia } from "./Marginalia";
import { PaperFrame } from "./PaperFrame";
import { TextFragment } from "./TextFragment";

type SceneProps = {
  paper: PaperContent;
};

function getViewportWidth() {
  return typeof window === "undefined" ? 1280 : window.innerWidth;
}

export function Scene({ paper }: SceneProps) {
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const viewport = getViewportKind(viewportWidth);
  const [sceneState, setSceneState] = useState(() => getInitialSceneState(viewport));

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(getViewportWidth());
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        setSceneState((current) => toggleMode(current));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSceneState((current) => stepPong(current));
    }, 16);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setSceneState((current) => {
      const nextViewport = getViewportKind(viewportWidth);
      const fallback = getInitialSceneState(nextViewport);
      return {
        ...current,
        visibleFragmentCount: Math.max(
          current.visibleFragmentCount,
          fallback.visibleFragmentCount
        )
      };
    });
  }, [viewportWidth]);

  const activeFragments = getInitialVisibleFragments(paper, viewport).slice(
    0,
    sceneState.visibleFragmentCount
  );
  const keywords = getVisibleKeywords(paper, viewport);
  const showMarginNotes = sceneState.mode === "read" && hasMarginNotes(viewportWidth);

  const handleSceneClick: React.MouseEventHandler<HTMLElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const normalizedY = rect.height === 0 ? 0.5 : (event.clientY - rect.top) / rect.height;

    setSceneState((current) =>
      movePlayerPaddleByClick(applyClickRally(current, viewport), normalizedY)
    );
  };

  return (
    <main
      className={`scene mode-${sceneState.mode}`}
      onClick={handleSceneClick}
    >
      <PaperFrame>
        <header className="masthead">
          <p className="eyebrow">playtext2 / paper pong reading room</p>
          <h1>{paper.title}</h1>
          <p className="byline">
            {paper.authors.join(", ")} / {paper.year}
          </p>
          <p className="mode-label">Mode: {sceneState.mode}</p>
        </header>

        <section className="arena">
          <div className="pong-stage">
            <div className="pong-divider" aria-hidden="true" />
            <div
              aria-label="ai paddle"
              className="pong-paddle pong-paddle-ai"
              style={{ top: `${sceneState.aiPaddleY}%` }}
            />
            <div
              aria-label="player paddle"
              className="pong-paddle pong-paddle-player"
              style={{ top: `${sceneState.playerPaddleY}%` }}
            />
            <div
              aria-label="pong ball"
              className="pong-ball"
              style={{
                left: `${sceneState.ballX}%`,
                top: `${sceneState.ballY}%`
              }}
            />

            <div className="pong-copy">
              <p className="abstract-label">Abstract</p>
              <p>{paper.abstract}</p>
            </div>
          </div>

          <div className={`fragment-field viewport-${viewport}`}>
            {activeFragments.map((fragment, index) => {
              const ballInfluenceX = ((sceneState.ballX - 50) / 50) * (index + 1) * 4;
              const ballInfluenceY = ((sceneState.ballY - 50) / 50) * (index + 1) * 3;
              const rotate = sceneState.mode === "play" ? (index % 2 === 0 ? -2 : 2) : 0;

              return (
                <TextFragment
                  key={fragment.id}
                  active={sceneState.mode === "play"}
                  text={fragment.text}
                  style={{
                    transform: `translate(${ballInfluenceX}px, ${ballInfluenceY}px) rotate(${rotate}deg)`
                  }}
                />
              );
            })}
          </div>

          {showMarginNotes ? (
            <Marginalia items={keywords} />
          ) : (
            <div className="keyword-row">
              {keywords.map((item) => (
                <span key={item} className="keyword-chip">
                  {item}
                </span>
              ))}
            </div>
          )}
        </section>

        <footer className="scene-footer">
          <p>Click upper or lower zones to step the right paddle. Press Space to settle or release the page.</p>
          <a href={paper.sourceUrl} target="_blank" rel="noreferrer">
            Source paper
          </a>
        </footer>
      </PaperFrame>
    </main>
  );
}
