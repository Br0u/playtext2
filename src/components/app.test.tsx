import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
  it("renders the source paper title", () => {
    render(<App />);
    expect(screen.getByText("Attention Is All You Need")).toBeInTheDocument();
  });
});
