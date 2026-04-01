export function getReadColumnCount(viewportWidth: number) {
  return viewportWidth >= 1024 ? 2 : 1;
}

export function hasMarginNotes(viewportWidth: number) {
  return viewportWidth >= 1024;
}
