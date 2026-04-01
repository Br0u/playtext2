import { useEffect, useState } from "react";
import type { PaperContent } from "../content";
import { hasMarginNotes } from "../layout/columns";
import {
  getInitialVisibleFragments,
  getVisibleKeywords,
  getViewportKind,
  type ViewportKind
} from "../scene/fragments";
import { applyClickRally, getInitialSceneState, toggleMode } from "../scene/state";
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
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

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

  const handleRally = () => {
    setSceneState((current) => applyClickRally(current, viewport));
  };

  const handlePointerMove: React.PointerEventHandler<HTMLElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
    setPointerOffset({ x, y });
  };

  const handlePointerLeave = () => {
    setPointerOffset({ x: 0, y: 0 });
  };

  return (
    <main
      className={`scene mode-${sceneState.mode}`}
      onClick={handleRally}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <PaperFrame>
        <header className="masthead">
          <p className="eyebrow">playtext2 / playable paper scene</p>
          <h1>{paper.title}</h1>
          <p className="byline">
            {paper.authors.slice(0, 3).join(", ")} et al. / {paper.year}
          </p>
          <p className="mode-label">Mode: {sceneState.mode}</p>
        </header>

        <section className="arena">
          <div className="abstract-block">
            <p className="abstract-label">Abstract</p>
            <p>{paper.abstract}</p>
          </div>

          <div className={`fragment-field viewport-${viewport}`}>
            {activeFragments.map((fragment, index) => {
              const motionScale = sceneState.mode === "play" ? 1 : 0.35;
              const x = pointerOffset.x * motionScale * (index + 1) * 0.6;
              const y = pointerOffset.y * motionScale * (index + 1) * 0.45;
              const rotate = sceneState.mode === "play" ? (index % 2 === 0 ? -1.5 : 1.5) : 0;

              return (
                <TextFragment
                  key={fragment.id}
                  active={sceneState.mode === "play"}
                  text={fragment.text}
                  style={{
                    transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`
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
          <p>Click to rally fragments. Press Space to settle or release the page.</p>
          <a href={paper.sourceUrl} target="_blank" rel="noreferrer">
            Source paper
          </a>
        </footer>
      </PaperFrame>
    </main>
  );
}
