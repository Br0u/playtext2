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

export type PageRegion = {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type TextBlock = {
  text: string;
  className: string;
  width: number;
  lineHeight: number;
  font: string;
  marginTop: number;
  marginBottom: number;
  obstacleAware?: boolean;
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

export function getTitleRegion(pageIndex = 0): PageRegion {
  return {
    pageIndex,
    x: PAGE_PADDING_X,
    y: PAGE_PADDING_TOP,
    width: BODY_WIDTH,
    height: 210
  };
}

export function getBodyRegions(pageCount = PAGE_COUNT, firstBodyTop = 320): PageRegion[] {
  const regions: PageRegion[] = [];
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    regions.push({
      pageIndex,
      x: PAGE_PADDING_X,
      y: pageIndex === 0 ? firstBodyTop : PAGE_PADDING_TOP + 34,
      width: BODY_WIDTH,
      height:
        PAGE_HEIGHT -
        (pageIndex === 0 ? firstBodyTop : PAGE_PADDING_TOP + 34) -
        PAGE_FOOTER_SPACE
    });
  }
  return regions;
}

function getTitleBlocks(paper: PaperContent): TextBlock[] {
  return [
    {
      text: paper.title,
      className: "paper-line paper-line--title",
      width: 620,
      lineHeight: 40,
      font: TITLE_FONT,
      marginTop: 0,
      marginBottom: 20
    },
    {
      text: `${paper.authors.join(", ")}.`,
      className: "paper-line paper-line--authors",
      width: 680,
      lineHeight: 18,
      font: AUTHORS_FONT,
      marginTop: 0,
      marginBottom: 12
    },
    {
      text: "Department of Computer Science, University of Toronto / Neural Networks Research Group",
      className: "paper-line paper-line--footnote",
      width: 700,
      lineHeight: 15,
      font: AUTHORS_FONT,
      marginTop: 0,
      marginBottom: 28
    },
    {
      text: "Abstract",
      className: "paper-line paper-line--section",
      width: 160,
      lineHeight: 22,
      font: SECTION_FONT,
      marginTop: 0,
      marginBottom: 8
    }
  ];
}

function getBodyBlocks(paper: PaperContent): TextBlock[] {
  const blocks: TextBlock[] = [
    {
      text: paper.abstract,
      className: "paper-line paper-line--body",
      width: BODY_WIDTH,
      lineHeight: BODY_LINE_HEIGHT,
      font: BODY_FONT,
      marginTop: 0,
      marginBottom: 24,
      obstacleAware: true
    }
  ];

  const sections = [
    {
      title: "1 Introduction",
      paragraphs: [paper.excerpts[0], `${paper.excerpts[1]} ${paper.excerpts[2]}`]
    },
    {
      title: "2 Architecture",
      paragraphs: [paper.excerpts[1], `${paper.excerpts[0]} ${paper.excerpts[3]}`]
    },
    {
      title: "3 Optimization",
      paragraphs: [paper.excerpts[2], `${paper.excerpts[3]} ${paper.sourceNote}`]
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
    blocks.push({
      text: section.title,
      className: "paper-line paper-line--section",
      width: 280,
      lineHeight: 22,
      font: SECTION_FONT,
      marginTop: 10,
      marginBottom: 8
    });

    section.paragraphs.forEach((paragraph, paragraphIndex) => {
      const isReference = sectionIndex === sections.length - 1;
      blocks.push({
        text: paragraph,
        className: isReference
          ? "paper-line paper-line--reference"
          : "paper-line paper-line--body",
        width: BODY_WIDTH,
        lineHeight: isReference ? 16 : BODY_LINE_HEIGHT,
        font: isReference ? REFERENCE_FONT : BODY_FONT,
        marginTop: 0,
        marginBottom: paragraphIndex === section.paragraphs.length - 1 ? 14 : 10,
        obstacleAware: !isReference
      });
    });
  });

  return blocks;
}

function layoutBlocksInRegions(
  blocks: TextBlock[],
  regions: PageRegion[],
  sceneState: SceneState,
  viewportHeight: number
) {
  const lines: PaperLine[] = [];
  let regionIndex = 0;
  let y = regions[0]?.y ?? PAGE_PADDING_TOP;

  for (const block of blocks) {
    y += block.marginTop;

    while (true) {
      const region = regions[regionIndex];
      if (region === undefined) {
        return { lines, endY: y };
      }

      if (y > region.y + region.height - block.lineHeight) {
        regionIndex += 1;
        y = regions[regionIndex]?.y ?? y;
        continue;
      }

      if (!block.obstacleAware) {
        const paragraphLines = getFragmentLines(block.text, block.width, block.font, block.lineHeight);
        let overflowed = false;
        for (const line of paragraphLines) {
          if (y + block.lineHeight > region.y + region.height) {
            overflowed = true;
            break;
          }
          lines.push({
            pageIndex: region.pageIndex,
            x: region.x,
            y,
            text: line,
            className: block.className,
            width: block.width
          });
          y += block.lineHeight;
        }

        if (overflowed) {
          regionIndex += 1;
          y = regions[regionIndex]?.y ?? y;
          continue;
        }

        y += block.marginBottom;
        break;
      }

      const pageObstacles = getPageObstacles(sceneState, viewportHeight);
      const result = layoutTextAroundObstacles({
        text: block.text,
        font: block.font,
        lineHeight: block.lineHeight,
        startY: y,
        bottomY: region.y + region.height,
        regionLeft: region.x,
        regionRight: region.x + region.width,
        circles: pageObstacles.circles,
        rects: pageObstacles.rects
      });

      if (result.lines.length === 0) {
        regionIndex += 1;
        y = regions[regionIndex]?.y ?? y;
        continue;
      }

      for (const line of result.lines) {
        lines.push({
          pageIndex: region.pageIndex,
          x: Math.round(line.x),
          y: Math.round(line.y),
          text: line.text,
          className: block.className,
          width: line.width
        });
      }

      y = result.endY + block.marginBottom;
      break;
    }
  }

  return { lines, endY: y };
}

export function buildDocumentLines(
  paper: PaperContent,
  sceneState: SceneState,
  viewportHeight: number
) {
  const lines: PaperLine[] = [];

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

  const titleResult = layoutBlocksInRegions(
    getTitleBlocks(paper),
    [getTitleRegion(0)],
    sceneState,
    viewportHeight
  );
  lines.push(...titleResult.lines);

  const firstBodyTop = Math.max(320, Math.round(titleResult.endY + 16));
  const bodyResult = layoutBlocksInRegions(
    getBodyBlocks(paper),
    getBodyRegions(PAGE_COUNT, firstBodyTop),
    sceneState,
    viewportHeight
  );
  lines.push(...bodyResult.lines);

  return lines;
}
