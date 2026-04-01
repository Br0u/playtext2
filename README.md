# playtext2

`playtext2` is a single-page interactive text work built around
`ImageNet Classification with Deep Convolutional Neural Networks`.
It mixes a minimal paper-pong court with a more settled reading state, using real paper
excerpts, classical book-like styling, and width-aware text layout.

## References

- Interaction direction: `paper-pong`
- Text layout inspiration: `@chenglou/pretext`
- Source paper:
  [`ImageNet Classification with Deep Convolutional Neural Networks`](https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html)

## Local Development

```bash
npm install
npm run dev
```

## Commands

```bash
npm test
npm run build
```

## Notes On Content

The current dataset is adapted from the AlexNet paper abstract and short excerpted passages
for interactive presentation. It does not present generated text as if it were original
paper language.
