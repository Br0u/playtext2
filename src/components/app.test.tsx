import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
  it("renders the source paper title", () => {
    render(<App />);
    expect(
      screen.getByText("ImageNet Classification with Deep Convolutional Neural Networks")
    ).toBeInTheDocument();
  });

  it("renders an obvious ball and both paddles", () => {
    render(<App />);
    expect(screen.getAllByLabelText("pong ball").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("ai paddle").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("player paddle").length).toBeGreaterThan(0);
  });
});
