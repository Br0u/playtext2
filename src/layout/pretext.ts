import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";

const DEFAULT_FONT = '400 18px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif';
const DEFAULT_LINE_HEIGHT = 30;

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
