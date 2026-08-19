import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import TicketRecovery from "../../../src/pages/tickets/TicketRecovery";
import "@testing-library/jest-dom";

jest.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }) => <div data-testid="qr-code">{value}</div>,
}));

const mockRequestMutate = jest.fn();
const mockConfirmMutate = jest.fn();
let mockRequestState = { isPending: false, isError: false, error: null };

jest.mock("../../../src/hooks/useTicketResendMutation", () => ({
  useRequestTicketResendMutation: () => ({
    mutate: mockRequestMutate,
    ...mockRequestState,
  }),
  useConfirmTicketResendMutation: () => ({
    mutate: mockConfirmMutate,
  }),
}));

function renderPage(search = "") {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/tickets/recover${search}`]}>
        <TicketRecovery />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe("TicketRecovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestState = { isPending: false, isError: false, error: null };
  });

  describe("without a token — request form", () => {
    it("renders the email request form", () => {
      renderPage();
      expect(screen.getByText("Recover Your Ticket")).toBeInTheDocument();
      expect(screen.getByLabelText("Your Email:")).toBeInTheDocument();
    });

    it("names the event when arriving from an event page's recover link", () => {
      renderPage("?event=Summer%20Cup");
      expect(screen.getByText("Summer Cup")).toBeInTheDocument();
    });

    it("submits the email and shows the generic confirmation on success", () => {
      mockRequestMutate.mockImplementation((email, { onSuccess }) => onSuccess());
      renderPage();

      fireEvent.change(screen.getByLabelText("Your Email:"), {
        target: { value: "guest@test.com" },
      });
      fireEvent.click(screen.getByText("Send Recovery Link"));

      expect(mockRequestMutate).toHaveBeenCalledWith("guest@test.com", expect.any(Object));
      expect(screen.getByText("Check your inbox")).toBeInTheDocument();
    });

    it("shows an error message when the request fails", () => {
      mockRequestState = {
        isPending: false,
        isError: true,
        error: { message: "A valid email address is required" },
      };
      renderPage();

      expect(screen.getByText("A valid email address is required")).toBeInTheDocument();
    });

    it("disables the submit button while pending", () => {
      mockRequestState = { isPending: true, isError: false, error: null };
      renderPage();

      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("with a token — confirmation", () => {
    it("calls confirm exactly once with the token from the URL", () => {
      act(() => {
        renderPage("?token=abc123");
      });
      expect(mockConfirmMutate).toHaveBeenCalledTimes(1);
      expect(mockConfirmMutate).toHaveBeenCalledWith("abc123", expect.any(Object));
    });

    it("shows a spinner while confirming", () => {
      // mutate() never resolves — stays in the pending state
      mockConfirmMutate.mockImplementation(() => {});
      renderPage("?token=abc123");
      expect(screen.getByText("Recovering your ticket…")).toBeInTheDocument();
    });

    it("shows the error and a retry link when the token is invalid or expired", () => {
      mockConfirmMutate.mockImplementation((token, { onError }) =>
        onError({ message: "This link has expired or is invalid." })
      );
      renderPage("?token=bad-token");

      expect(screen.getByText("This link has expired or is invalid.")).toBeInTheDocument();
      expect(screen.getByText("Request a New Link")).toBeInTheDocument();
    });

    it("renders the recovered ticket(s) on success", () => {
      mockConfirmMutate.mockImplementation((token, { onSuccess }) =>
        onSuccess({
          tickets: [
            { _id: "t1", ticketCode: "TKT-AAA111", eventId: { title: "Summer Cup" } },
            { _id: "t2", ticketCode: "TKT-BBB222", eventId: { title: "Summer Cup" } },
          ],
          email: "guest@test.com",
        })
      );
      renderPage("?token=good-token");

      expect(screen.getByText("Ticket Recovered")).toBeInTheDocument();
      expect(screen.getByText("TKT-AAA111")).toBeInTheDocument();
      expect(screen.getByText("TKT-BBB222")).toBeInTheDocument();
    });
  });
});
