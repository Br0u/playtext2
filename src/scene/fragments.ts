import type { PaperContent } from "../content";

export type ViewportKind = "mobile" | "desktop";

export function getViewportKind(viewportWidth: number): ViewportKind {
  return viewportWidth >= 768 ? "desktop" : "mobile";
}

export function getPlayVisibleFragmentCount(viewport: ViewportKind) {
  return viewport === "desktop" ? 4 : 2;
}

export function getPlayKeywordCount(viewport: ViewportKind) {
  return viewport === "desktop" ? 4 : 2;
}

export function getInitialVisibleFragments(paper: PaperContent, viewport: ViewportKind) {
  return paper.fragments.filter((fragment) => fragment.kind !== "keyword");
}

export function getVisibleKeywords(paper: PaperContent, viewport: ViewportKind) {
  return paper.keywords.slice(0, getPlayKeywordCount(viewport));
}
