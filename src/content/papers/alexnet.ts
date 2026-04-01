import type { PaperContent } from "../schema";

const abstractText =
  "We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images in the ImageNet LSVRC-2010 contest into the 1000 different classes. On the test data, we achieved top-1 and top-5 error rates of 37.5% and 17.0% which is considerably better than the previous state of the art.";

const excerpts = [
  "Our network contains eight learned layers, five convolutional and three fully connected, and has 60 million parameters and 650,000 neurons.",
  "To make training faster, we used non-saturating neurons and a very efficient GPU implementation of the convolution operation.",
  "We employed a recently-developed regularization method called dropout that proved to be very effective at reducing overfitting.",
  "The network's size is limited mainly by the amount of memory available on current GPUs and by the amount of training time that we are willing to tolerate."
];

const keywords = [
  "AlexNet",
  "ImageNet",
  "convolutional network",
  "dropout",
  "GPU training",
  "ReLU"
];

export const alexNetPaper: PaperContent = {
  slug: "alexnet",
  title: "ImageNet Classification with Deep Convolutional Neural Networks",
  authors: [
    "Alex Krizhevsky",
    "Ilya Sutskever",
    "Geoffrey E. Hinton"
  ],
  year: 2012,
  sourceUrl:
    "https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html",
  sourceNote:
    "Adapted from the abstract and short excerpted passages for interactive presentation.",
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
