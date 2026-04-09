import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "../../../src/components/admin/Pagination";
import "@testing-library/jest-dom";

describe("Pagination", () => {
  it("shows only a count label when totalPages is 1", () => {
    render(<Pagination page={1} totalPages={1} setPage={jest.fn()} total={5} label="items" />);
    expect(screen.getByText("5 items")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders page buttons and arrows when totalPages > 1", () => {
    render(<Pagination page={1} totalPages={3} setPage={jest.fn()} total={40} label="tickets" />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("40 tickets")).toBeInTheDocument();
  });

  it("calls setPage when a page number is clicked", () => {
    const setPage = jest.fn();
    render(<Pagination page={1} totalPages={3} setPage={setPage} total={40} label="tickets" />);
    fireEvent.click(screen.getByText("2"));
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it("calls setPage with next page on next arrow click", () => {
    const setPage = jest.fn();
    render(<Pagination page={1} totalPages={3} setPage={setPage} total={40} label="tickets" />);
    const buttons = screen.getAllByRole("button");
    const nextBtn = buttons[buttons.length - 1];
    fireEvent.click(nextBtn);
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it("disables prev arrow on first page", () => {
    render(<Pagination page={1} totalPages={3} setPage={jest.fn()} total={40} label="tickets" />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });

  it("disables next arrow on last page", () => {
    render(<Pagination page={3} totalPages={3} setPage={jest.fn()} total={40} label="tickets" />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it("shows at most 5 page buttons centered on current page", () => {
    render(<Pagination page={5} totalPages={10} setPage={jest.fn()} total={150} label="items" />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("8")).not.toBeInTheDocument();
  });

  it("shifts window left near the end to fill 5 slots", () => {
    render(<Pagination page={10} totalPages={10} setPage={jest.fn()} total={150} label="items" />);
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
