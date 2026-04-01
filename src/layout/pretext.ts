import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";

const DEFAULT_FONT = '400 18px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif';
const DEFAULT_LINE_HEIGHT = 30;
const EFFECT_RADIUS = 18;
const MAX_WIDTH_REDUCTION = 140;
const MAX_OFFSET = 54;

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
