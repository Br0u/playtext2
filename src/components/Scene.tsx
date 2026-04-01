import { useEffect, useMemo, useState } from "react";
import type { PaperContent } from "../content";
import {
  getFragmentLines,
  layoutTextAroundObstacles
} from "../layout/pretext";
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

type PaperLine = {
  pageIndex: number;
  x: number;
  y: number;
  text: string;
  className: string;
  width?: number;
};

const PAGE_COUNT = 4;
const PAGE_HEIGHT = 1160;
const PAGE_WIDTH = 900;
const PAGE_PADDING_X = 74;
const PAGE_PADDING_TOP = 58;
const PAGE_FOOTER_SPACE = 66;
const BODY_WIDTH = 752;
const BODY_LINE_HEIGHT = 18;
const BODY_FONT = '400 13px "Times New Roman", Times, serif';
const TITLE_FONT = '600 34px "Times New Roman", Times, serif';
const AUTHORS_FONT = '400 13px "Times New Roman", Times, serif';
const SECTION_FONT = '700 18px "Times New Roman", Times, serif';
const REFERENCE_FONT = '400 11.5px "Times New Roman", Times, serif';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getViewportWidth() {
  return typeof window === "undefined" ? 1280 : window.innerWidth;
}

function getViewportHeight() {
  return typeof window === "undefined" ? 900 : window.innerHeight;
}

function getPageObstacles(sceneState: SceneState, pageWidth: number, pageHeight: number) {
  return {
    circles: [
      {
        cx: pageWidth * (sceneState.ballX / 100),
        cy: pageHeight * (sceneState.ballY / 100),
        r: 20,
        hPad: 18,
        vPad: 4
      }
    ],
    rects: [
      {
        x: 0,
        y: pageHeight * (sceneState.aiPaddleY / 100) - 59,
        w: 20,
        h: 118,
        hPad: 10,
        vPad: 2
      },
      {
        x: pageWidth - 20,
        y: pageHeight * (sceneState.playerPaddleY / 100) - 59,
        w: 20,
        h: 118,
        hPad: 10,
        vPad: 2
      }
    ]
  };
}

function buildDocumentLines(
  paper: PaperContent,
  sceneState: SceneState,
  viewportWidth: number,
  viewportHeight: number
) {
  const lines: PaperLine[] = [];
  let pageIndex = 0;
  let y = PAGE_PADDING_TOP;

  const addLines = (
    text: string,
    options: {
      className: string;
      width: number;
      lineHeight: number;
      font: string;
      x?: number;
      marginTop?: number;
      marginBottom?: number;
    }
  ) => {
    y += options.marginTop ?? 0;
    const paragraphLines = getFragmentLines(
      text,
      options.width,
      options.font,
      options.lineHeight
    );

    for (const line of paragraphLines) {
      if (y + options.lineHeight > PAGE_HEIGHT - PAGE_FOOTER_SPACE) {
        pageIndex += 1;
        if (pageIndex >= PAGE_COUNT) {
          return;
        }
        y = PAGE_PADDING_TOP + 34;
      }

      lines.push({
        pageIndex,
        x: options.x ?? PAGE_PADDING_X,
        y,
        text: line,
        className: options.className,
        width: options.width
      });
      y += options.lineHeight;
    }

    y += options.marginBottom ?? 0;
  };

  for (let index = 0; index < PAGE_COUNT; index += 1) {
    lines.push({
      pageIndex: index,
      x: PAGE_PADDING_X,
      y: 16,
      text: index % 2 === 0 ? paper.title : `${paper.authors[0]} et al.`,
      className:
        index % 2 === 0
          ? "paper-line paper-line--running-header"
          : "paper-line paper-line--running-header-meta"
    });
  }

  addLines(paper.title, {
    className: "paper-line paper-line--title",
    width: 620,
    lineHeight: 40,
    font: TITLE_FONT,
    marginBottom: 20
  });

  addLines(`${paper.authors.join(", ")}.`, {
    className: "paper-line paper-line--authors",
    width: 680,
    lineHeight: 18,
    font: AUTHORS_FONT,
    marginBottom: 12
  });

  addLines(
    "Department of Computer Science, University of Toronto / Neural Networks Research Group",
    {
      className: "paper-line paper-line--footnote",
      width: 700,
      lineHeight: 15,
      font: AUTHORS_FONT,
      marginBottom: 28
    }
  );

  addLines("Abstract", {
    className: "paper-line paper-line--section",
    width: 160,
    lineHeight: 22,
    font: SECTION_FONT,
    marginBottom: 8
  });

  const addObstacleAwareParagraph = (
    text: string,
    className: string,
    lineHeight: number,
    font: string,
    marginBottom = 14
  ) => {
    const pageObstacles = getPageObstacles(
      {
        ...sceneState,
        ballY: (sceneState.ballY / 100) * viewportHeight / PAGE_HEIGHT * 100,
        aiPaddleY: (sceneState.aiPaddleY / 100) * viewportHeight / PAGE_HEIGHT * 100,
        playerPaddleY: (sceneState.playerPaddleY / 100) * viewportHeight / PAGE_HEIGHT * 100
      },
      PAGE_WIDTH,
      PAGE_HEIGHT
    );
    const result = layoutTextAroundObstacles({
      text,
      font,
      lineHeight,
      startY: y,
      bottomY: PAGE_HEIGHT - PAGE_FOOTER_SPACE,
      regionLeft: PAGE_PADDING_X,
      regionRight: PAGE_PADDING_X + BODY_WIDTH,
      circles: pageObstacles.circles,
      rects: pageObstacles.rects
    });

    for (const line of result.lines) {
      if (line.y + lineHeight > PAGE_HEIGHT - PAGE_FOOTER_SPACE) {
        pageIndex += 1;
        if (pageIndex >= PAGE_COUNT) {
          return;
        }
      }

      lines.push({
        pageIndex,
        x: Math.round(line.x),
        y: Math.round(line.y),
        text: line.text,
        className,
        width: line.width
      });
    }
    y = result.endY + marginBottom;
  };

  addObstacleAwareParagraph(
    paper.abstract,
    "paper-line paper-line--body",
    BODY_LINE_HEIGHT,
    BODY_FONT,
    24
  );

  const sections = [
    {
      title: "1 Introduction",
      paragraphs: [
        paper.excerpts[0],
        `${paper.excerpts[1]} ${paper.excerpts[2]}`
      ]
    },
    {
      title: "2 Architecture",
      paragraphs: [
        paper.excerpts[1],
        `${paper.excerpts[0]} ${paper.excerpts[3]}`
      ]
    },
    {
      title: "3 Optimization",
      paragraphs: [
        paper.excerpts[2],
        `${paper.excerpts[3]} ${paper.sourceNote}`
      ]
    },
    {
      title: "References",
      paragraphs: [
        `${paper.authors[0]}, ${paper.authors[1]}, ${paper.authors[2]}. ${paper.title}. Advances in Neural Information Processing Systems, 2012.`,
        `Keywords: ${paper.keywords.join(", ")}.`
      ]
    }
  ];

  sections.forEach((section, sectionIndex) => {
    addLines(section.title, {
      className: "paper-line paper-line--section",
      width: 280,
      lineHeight: 22,
      font: SECTION_FONT,
      marginTop: 10,
      marginBottom: 8
    });

    section.paragraphs.forEach((paragraph, paragraphIndex) => {
      addObstacleAwareParagraph(
        paragraph,
        sectionIndex === sections.length - 1
          ? "paper-line paper-line--reference"
          : "paper-line paper-line--body",
        sectionIndex === sections.length - 1 ? 16 : BODY_LINE_HEIGHT,
        sectionIndex === sections.length - 1 ? REFERENCE_FONT : BODY_FONT,
        paragraphIndex === section.paragraphs.length - 1 ? 14 : 10
      );
    });
  });

  return lines;
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
    () => buildDocumentLines(paper, sceneState, viewportWidth, viewportHeight),
    [paper, sceneState, viewportWidth, viewportHeight]
  );

  const bricks = useMemo(
    () =>
      paper.keywords.map((keyword, index) => ({
        text: keyword,
        pageIndex: Math.min(3, Math.floor(index / 2)),
        x: 540 + (index % 2) * 118,
        y: 178 + index * 54,
        strength: index % 3 === 0 ? 2 : 1
      })),
    [paper.keywords]
  );

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
