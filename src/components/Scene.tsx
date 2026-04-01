import { useEffect, useState } from "react";
import type { PaperContent } from "../content";
import { hasMarginNotes } from "../layout/columns";
import { getParagraphLayoutWidth, getParagraphOffset } from "../layout/pretext";
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
  const paragraphBaseWidth = viewportWidth >= 1100 ? 560 : viewportWidth >= 768 ? 500 : 320;
  const paragraphCenters = activeFragments.map((_, index) => 28 + index * 14);

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
          <p className="eyebrow">playtext2</p>
          <h1>{paper.title}</h1>
          <p className="byline">
            {paper.authors.join(", ")} / {paper.year}
          </p>
          <p className="mode-label">Local pong influence / {sceneState.mode}</p>
        </header>

        <section className="paper-layout">
          <article className="paper-article">
            <section className="article-section article-section-lead">
              <p className="abstract-label">Abstract</p>
              <p className="lead-paragraph">{paper.abstract}</p>
            </section>

            <section className="article-section article-section-body">
              {activeFragments.map((fragment, index) => {
                const paragraphCenterY = paragraphCenters[index] ?? 50;
                const motionDampener = sceneState.mode === "play" ? 1 : 0.35;
                const width = getParagraphLayoutWidth({
                  baseWidth: paragraphBaseWidth,
                  paragraphCenterY,
                  ballY: sceneState.ballY
                });
                const offset = getParagraphOffset({
                  paragraphCenterY,
                  ballX: sceneState.ballX,
                  ballY: sceneState.ballY
                }) * motionDampener;

                return (
                  <TextFragment
                    key={fragment.id}
                    active={sceneState.mode === "play"}
                    text={fragment.text}
                    width={width}
                    style={{
                      maxWidth: `${width}px`,
                      transform: `translateX(${offset}px)`
                    }}
                  />
                );
              })}
            </section>
          </article>

          <div className="pong-overlay" aria-hidden="true">
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
          </div>
          <aside className="paper-notes">
            <p className="abstract-label">Notes</p>
            {showMarginNotes ? <Marginalia items={keywords} /> : null}
            {!showMarginNotes ? (
              <div className="keyword-row">
                {keywords.map((item) => (
                  <span key={item} className="keyword-chip">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </aside>
        </section>

        <footer className="scene-footer">
          <p>Click upper or lower areas to step the right paddle. The ball locally compresses nearby paragraphs.</p>
          <a href={paper.sourceUrl} target="_blank" rel="noreferrer">
            Source paper
          </a>
        </footer>
      </PaperFrame>
    </main>
  );
}
