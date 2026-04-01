import type { PaperContent } from "../schema";

const abstractText =
  "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.";

const excerpts = [
  "In the proposed Transformer, the encoder and decoder stacks rely on self-attention and point-wise, fully connected layers.",
  "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.",
  "On two machine translation tasks, the Transformer achieves superior quality while being more parallelizable and requiring significantly less time to train.",
  "Self-attention relates different positions of a single sequence in order to compute a representation of the sequence."
];

const keywords = [
  "attention",
  "transformer",
  "self-attention",
  "multi-head attention",
  "sequence transduction",
  "parallelization"
];

export const attentionIsAllYouNeed: PaperContent = {
  slug: "attention-is-all-you-need",
  title: "Attention Is All You Need",
  authors: [
    "Ashish Vaswani",
    "Noam Shazeer",
    "Niki Parmar",
    "Jakob Uszkoreit",
    "Llion Jones",
    "Aidan N. Gomez",
    "Lukasz Kaiser",
    "Illia Polosukhin"
  ],
  year: 2017,
  sourceUrl: "https://arxiv.org/abs/1706.03762",
  sourceNote: "Adapted from the paper abstract and short excerpted passages for interactive presentation.",
  abstract: abstractText,
  excerpts,
  keywords,
  fragments: [
    { id: "abstract-1", text: abstractText, kind: "abstract" },
    ...excerpts.map((text, index) => ({
      id: `excerpt-${index + 1}`,
      text,
      kind: "excerpt" as const
    })),
    ...keywords.map((text, index) => ({
      id: `keyword-${index + 1}`,
      text,
      kind: "keyword" as const
    }))
  ]
};
