import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthInitializer from "../../../src/components/common/AuthInitializer";

jest.mock("../../../src/auth/auth", () => ({
  getAuthToken: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

const { getAuthToken, refreshAccessToken } = require("../../../src/auth/auth");

describe("AuthInitializer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children immediately when a token is already present", async () => {
    getAuthToken.mockReturnValue("existing-token");

    render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>
    );

    await waitFor(() => expect(screen.getByText("App Content")).toBeInTheDocument());
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it("renders nothing while a refresh is pending when there is no token", () => {
    getAuthToken.mockReturnValue(null);
    refreshAccessToken.mockReturnValue(new Promise(() => {})); // never resolves

    const { container } = render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("App Content")).not.toBeInTheDocument();
  });

  it("renders children once the refresh attempt settles (success or failure)", async () => {
    getAuthToken.mockReturnValue(null);
    refreshAccessToken.mockResolvedValue(false); // failed refresh still "settles"

    render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>
    );

    await waitFor(() => expect(screen.getByText("App Content")).toBeInTheDocument());
  });
});
