export type PaperFragment = {
  id: string;
  text: string;
  kind: "abstract" | "excerpt" | "keyword";
};

export type PaperContent = {
  slug: string;
  title: string;
  authors: string[];
  year: number;
  sourceUrl: string;
  sourceNote: string;
  abstract: string;
  excerpts: string[];
  keywords: string[];
  fragments: PaperFragment[];
};
