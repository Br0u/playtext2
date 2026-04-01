import { layoutNextLine, layoutWithLines, prepareWithSegments } from "@chenglou/pretext";

const DEFAULT_FONT = '400 18px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif';
const DEFAULT_LINE_HEIGHT = 30;
const EFFECT_RADIUS = 18;
const MAX_WIDTH_REDUCTION = 140;
const MAX_OFFSET = 54;

type Slot = {
  left: number;
  right: number;
};

type CircleObstacle = {
  cx: number;
  cy: number;
  r: number;
  hPad?: number;
  vPad?: number;
};

type RectObstacle = {
  x: number;
  y: number;
  w: number;
  h: number;
  hPad?: number;
  vPad?: number;
};

type PreparedCursor = {
  segmentIndex: number;
  graphemeIndex: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getNormalizedInfluence(distance: number) {
  if (distance >= EFFECT_RADIUS) {
    return 0;
  }

  return 1 - distance / EFFECT_RADIUS;
}

export function getParagraphLayoutWidth({
  baseWidth,
  paragraphCenterY,
  ballY
}: {
  baseWidth: number;
  paragraphCenterY: number;
  ballY: number;
}) {
  const influence = getNormalizedInfluence(Math.abs(paragraphCenterY - ballY));
  return Math.round(clamp(baseWidth - influence * MAX_WIDTH_REDUCTION, 220, baseWidth));
}

export function getParagraphOffset({
  paragraphCenterY,
  ballX,
  ballY
}: {
  paragraphCenterY: number;
  ballX: number;
  ballY: number;
}) {
  const influence = getNormalizedInfluence(Math.abs(paragraphCenterY - ballY));
  if (influence === 0) {
    return 0;
  }

  const direction = ballX >= 50 ? -1 : 1;
  return Math.round(direction * influence * MAX_OFFSET);
}

export function getFragmentLines(
  text: string,
  maxWidth: number,
  font = DEFAULT_FONT,
  lineHeight = DEFAULT_LINE_HEIGHT
) {
  if (typeof document === "undefined") {
    return [text];
  }

  if (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom")) {
    return [text];
  }

  try {
    const prepared = prepareWithSegments(text, font);
    const { lines } = layoutWithLines(prepared, maxWidth, lineHeight);
    return lines.map((line) => line.text);
  } catch {
    return [text];
  }
}

export function carveTextLineSlots(base: Slot, blocked: Slot[]) {
  let slots = [base];

  for (const interval of blocked) {
    const next: Slot[] = [];
    for (const slot of slots) {
      if (interval.right <= slot.left || interval.left >= slot.right) {
        next.push(slot);
        continue;
      }

      if (interval.left > slot.left) {
        next.push({ left: slot.left, right: interval.left });
      }

      if (interval.right < slot.right) {
        next.push({ left: interval.right, right: slot.right });
      }
    }
    slots = next;
  }

  return slots.filter((slot) => slot.right - slot.left >= 72);
}

export function circleIntervalForBand(
  obstacle: CircleObstacle,
  bandTop: number,
  bandBottom: number
) {
  const top = bandTop - (obstacle.vPad ?? 0);
  const bottom = bandBottom + (obstacle.vPad ?? 0);
  if (top >= obstacle.cy + obstacle.r || bottom <= obstacle.cy - obstacle.r) {
    return null;
  }

  const minDy =
    obstacle.cy >= top && obstacle.cy <= bottom
      ? 0
      : obstacle.cy < top
        ? top - obstacle.cy
        : obstacle.cy - bottom;

  if (minDy >= obstacle.r) {
    return null;
  }

  const maxDx = Math.sqrt(obstacle.r * obstacle.r - minDy * minDy);
  return {
    left: obstacle.cx - maxDx - (obstacle.hPad ?? 0),
    right: obstacle.cx + maxDx + (obstacle.hPad ?? 0)
  };
}

export function rectIntervalForBand(
  obstacle: RectObstacle,
  bandTop: number,
  bandBottom: number
) {
  const vPad = obstacle.vPad ?? 0;
  if (bandBottom <= obstacle.y - vPad || bandTop >= obstacle.y + obstacle.h + vPad) {
    return null;
  }

  return {
    left: obstacle.x - (obstacle.hPad ?? 0),
    right: obstacle.x + obstacle.w + (obstacle.hPad ?? 0)
  };
}

function approximateNextLine(text: string, maxWidth: number) {
  const trimmed = text.trimStart();
  if (trimmed.length === 0) {
    return { text: "", rest: "" };
  }

  const maxChars = Math.max(10, Math.floor(maxWidth / 7));
  if (trimmed.length <= maxChars) {
    return { text: trimmed, rest: "" };
  }

  const slice = trimmed.slice(0, maxChars + 1);
  const breakIndex = slice.lastIndexOf(" ");
  const splitAt = breakIndex > 0 ? breakIndex : maxChars;
  return {
    text: trimmed.slice(0, splitAt).trimEnd(),
    rest: trimmed.slice(splitAt).trimStart()
  };
}

export function layoutTextAroundObstacles({
  text,
  font,
  lineHeight,
  startY,
  bottomY,
  regionLeft,
  regionRight,
  circles,
  rects
}: {
  text: string;
  font: string;
  lineHeight: number;
  startY: number;
  bottomY: number;
  regionLeft: number;
  regionRight: number;
  circles: CircleObstacle[];
  rects: RectObstacle[];
}) {
  const output: { text: string; x: number; y: number; width: number }[] = [];
  const canMeasure =
    typeof document !== "undefined" &&
    !(typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom"));
  const prepared = canMeasure ? prepareWithSegments(text, font) : null;
  let cursor: PreparedCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let remainingText = text;
  let y = startY;

  while (y + lineHeight <= bottomY) {
    const blocked: Slot[] = [];
    for (const circle of circles) {
      const interval = circleIntervalForBand(circle, y, y + lineHeight);
      if (interval !== null) {
        blocked.push(interval);
      }
    }

    for (const rect of rects) {
      const interval = rectIntervalForBand(rect, y, y + lineHeight);
      if (interval !== null) {
        blocked.push(interval);
      }
    }

    const slots = carveTextLineSlots(
      { left: regionLeft, right: regionRight },
      blocked.sort((a, b) => a.left - b.left)
    );

    if (slots.length === 0) {
      y += lineHeight;
      continue;
    }

    let progressed = false;
    for (const slot of slots) {
      const width = slot.right - slot.left;

      if (prepared !== null) {
        const line = layoutNextLine(prepared, cursor, width);
        if (line === null) {
          return { lines: output, endY: y };
        }
        if (
          line.end.segmentIndex === cursor.segmentIndex &&
          line.end.graphemeIndex === cursor.graphemeIndex
        ) {
          continue;
        }

        output.push({
          text: line.text,
          x: slot.left,
          y,
          width: line.width
        });
        cursor = line.end;
        progressed = true;
      } else {
        const next = approximateNextLine(remainingText, width);
        if (next.text.length === 0) {
          return { lines: output, endY: y };
        }
        output.push({
          text: next.text,
          x: slot.left,
          y,
          width
        });
        remainingText = next.rest;
        progressed = true;
        if (remainingText.length === 0) {
          return { lines: output, endY: y + lineHeight };
        }
      }
    }

    if (!progressed) {
      y += lineHeight;
      continue;
    }

    if (prepared !== null) {
      const nextProbe = layoutNextLine(prepared, cursor, 100000);
      if (nextProbe === null) {
        return { lines: output, endY: y + lineHeight };
      }
    }

    y += lineHeight;
  }

  return { lines: output, endY: y };
}
