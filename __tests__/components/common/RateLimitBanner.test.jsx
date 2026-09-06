import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import RateLimitBanner from "../../../src/components/common/RateLimitBanner";
import { setRateLimited, getRateLimited } from "../../../src/util/errorUtil";

describe("RateLimitBanner", () => {
  afterEach(() => {
    act(() => setRateLimited(false));
  });

  it("renders nothing when not rate limited", () => {
    render(<RateLimitBanner />);
    expect(screen.queryByText(/Too many requests/i)).not.toBeInTheDocument();
  });

  it("shows the banner once setRateLimited(true) fires", () => {
    render(<RateLimitBanner />);
    act(() => setRateLimited(true));
    expect(screen.getByText(/Too many requests/i)).toBeInTheDocument();
  });

  it("clears the flag and hides itself when dismissed", () => {
    act(() => setRateLimited(true));
    render(<RateLimitBanner />);
    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText(/Too many requests/i)).not.toBeInTheDocument();
    expect(getRateLimited()).toBe(false);
  });
});
