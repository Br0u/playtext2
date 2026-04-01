import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
  it("renders the source paper title", () => {
    render(<App />);
    expect(
      screen.getAllByText("ImageNet Classification with Deep Convolutional Neural Networks").length
    ).toBeGreaterThan(0);
  });

  it("renders the fixed hud and pong pieces", () => {
    render(<App />);
    expect(screen.getByText("Paper Pong")).toBeInTheDocument();
    expect(screen.getByText("00 : 00")).toBeInTheDocument();
    expect(
      screen.getByText("Click to control the right paddle. Press Esc to return it to AI.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("left paddle")).toBeInTheDocument();
    expect(screen.getByLabelText("right paddle")).toBeInTheDocument();
    expect(screen.getByLabelText("bottom paddle")).toBeInTheDocument();
    expect(screen.getByLabelText("pong ball")).toBeInTheDocument();
  });

  it("renders a stack of four paper sheets", () => {
    render(<App />);
    expect(screen.getByLabelText("paper sheet 1")).toBeInTheDocument();
    expect(screen.getByLabelText("paper sheet 2")).toBeInTheDocument();
    expect(screen.getByLabelText("paper sheet 3")).toBeInTheDocument();
    expect(screen.getByLabelText("paper sheet 4")).toBeInTheDocument();
  });
});
