import type { PaperContent } from "../content";
import type { SceneState } from "../scene/state";
import { getFragmentLines, layoutTextAroundObstacles } from "./pretext";

export type PaperLine = {
  pageIndex: number;
  x: number;
  y: number;
  text: string;
  className: string;
  width?: number;
};

export type TextBrick = {
  text: string;
  pageIndex: number;
  x: number;
  y: number;
  strength: number;
};

export const PAGE_COUNT = 4;
export const PAGE_HEIGHT = 1160;
export const PAGE_WIDTH = 900;
export const PAGE_PADDING_X = 74;
export const PAGE_PADDING_TOP = 58;
export const PAGE_FOOTER_SPACE = 66;
export const BODY_WIDTH = 752;
export const BODY_LINE_HEIGHT = 18;
export const BODY_FONT = '400 13px "Times New Roman", Times, serif';
export const TITLE_FONT = '600 34px "Times New Roman", Times, serif';
export const AUTHORS_FONT = '400 13px "Times New Roman", Times, serif';
export const SECTION_FONT = '700 18px "Times New Roman", Times, serif';
export const REFERENCE_FONT = '400 11.5px "Times New Roman", Times, serif';

function scalePercentToPage(value: number, pageExtent: number, viewportExtent: number) {
  return pageExtent * ((value / 100) * viewportExtent / pageExtent);
}

export function getPageObstacles(
  sceneState: SceneState,
  viewportHeight: number,
  pageWidth = PAGE_WIDTH,
  pageHeight = PAGE_HEIGHT
) {
  return {
    circles: [
      {
        cx: pageWidth * (sceneState.ballX / 100),
        cy: scalePercentToPage(sceneState.ballY, pageHeight, viewportHeight),
        r: 20,
        hPad: 18,
        vPad: 4
      }
    ],
    rects: [
      {
        x: 0,
        y: scalePercentToPage(sceneState.aiPaddleY, pageHeight, viewportHeight) - 59,
        w: 20,
        h: 118,
        hPad: 10,
        vPad: 2
      },
      {
        x: pageWidth - 20,
        y: scalePercentToPage(sceneState.playerPaddleY, pageHeight, viewportHeight) - 59,
        w: 20,
        h: 118,
        hPad: 10,
        vPad: 2
      }
    ]
  };
}

export function getBrickLayouts(paper: PaperContent): TextBrick[] {
  return paper.keywords.map((keyword, index) => ({
    text: keyword,
    pageIndex: Math.min(PAGE_COUNT - 1, Math.floor(index / 2)),
    x: 540 + (index % 2) * 118,
    y: 178 + index * 54,
    strength: index % 3 === 0 ? 2 : 1
  }));
}

export function buildDocumentLines(
  paper: PaperContent,
  sceneState: SceneState,
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
    const paragraphLines = getFragmentLines(text, options.width, options.font, options.lineHeight);

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

  const addObstacleAwareParagraph = (
    text: string,
    className: string,
    lineHeight: number,
    font: string,
    marginBottom = 14
  ) => {
    const pageObstacles = getPageObstacles(sceneState, viewportHeight);
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
