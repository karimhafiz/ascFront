import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImageWithFallback from "../../../src/components/common/ImageWithFallback";

describe("ImageWithFallback", () => {
  it("renders a normal img with the given src initially", () => {
    render(<ImageWithFallback src="https://example.com/pic.jpg" alt="A picture" />);
    const img = screen.getByAltText("A picture");
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "https://example.com/pic.jpg");
  });

  it("shows the fallback placeholder after the image fails to load", () => {
    render(<ImageWithFallback src="https://example.com/broken.jpg" alt="A picture" />);
    fireEvent.error(screen.getByAltText("A picture"));

    expect(screen.queryByAltText("A picture")).not.toBeInTheDocument();
    expect(screen.getByText("Image no longer available")).toBeInTheDocument();
  });

  it("resets to showing the img when src changes after a failure", () => {
    const { rerender } = render(
      <ImageWithFallback src="https://example.com/broken.jpg" alt="A picture" />
    );
    fireEvent.error(screen.getByAltText("A picture"));
    expect(screen.getByText("Image no longer available")).toBeInTheDocument();

    rerender(<ImageWithFallback src="https://example.com/new.jpg" alt="A picture" />);

    expect(screen.getByAltText("A picture")).toBeInTheDocument();
    expect(screen.queryByText("Image no longer available")).not.toBeInTheDocument();
  });

  it("passes through extra props and className to the img", () => {
    render(
      <ImageWithFallback
        src="https://example.com/pic.jpg"
        alt="A picture"
        className="rounded-xl"
        data-testid="custom-img"
      />
    );
    const img = screen.getByTestId("custom-img");
    expect(img).toHaveClass("rounded-xl");
  });
});
