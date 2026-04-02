import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SortableHeader from "../../../src/components/common/SortableHeader";
import "@testing-library/jest-dom";

function renderHeader(props = {}) {
  const defaultProps = {
    label: "Date",
    sortKey: "date",
    sort: { key: null, dir: "asc" },
    onSort: jest.fn(),
  };
  const merged = { ...defaultProps, ...props };
  return render(
    <table>
      <thead>
        <tr>
          <SortableHeader {...merged} />
        </tr>
      </thead>
    </table>
  );
}

describe("SortableHeader", () => {
  it("renders the label text", () => {
    renderHeader();
    expect(screen.getByText("Date")).toBeInTheDocument();
  });

  it("calls onSort with ascending when clicking an inactive column", () => {
    const onSort = jest.fn();
    renderHeader({ onSort, sort: { key: null, dir: "asc" } });
    fireEvent.click(screen.getByText("Date").closest("th"));
    expect(onSort).toHaveBeenCalledWith({ key: "date", dir: "asc" });
  });

  it("calls onSort with descending when clicking an active ascending column", () => {
    const onSort = jest.fn();
    renderHeader({ onSort, sort: { key: "date", dir: "asc" } });
    fireEvent.click(screen.getByText("Date").closest("th"));
    expect(onSort).toHaveBeenCalledWith({ key: "date", dir: "desc" });
  });

  it("calls onSort with null key when clicking an active descending column", () => {
    const onSort = jest.fn();
    renderHeader({ onSort, sort: { key: "date", dir: "desc" } });
    fireEvent.click(screen.getByText("Date").closest("th"));
    expect(onSort).toHaveBeenCalledWith({ key: null, dir: "asc" });
  });

  it("cycles through asc -> desc -> clear on repeated clicks", () => {
    const onSort = jest.fn();
    const { rerender } = render(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Price"
              sortKey="price"
              sort={{ key: null, dir: "asc" }}
              onSort={onSort}
            />
          </tr>
        </thead>
      </table>
    );

    // Click 1: activate ascending
    fireEvent.click(screen.getByText("Price").closest("th"));
    expect(onSort).toHaveBeenLastCalledWith({ key: "price", dir: "asc" });

    // Simulate parent updating sort state
    rerender(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Price"
              sortKey="price"
              sort={{ key: "price", dir: "asc" }}
              onSort={onSort}
            />
          </tr>
        </thead>
      </table>
    );

    // Click 2: flip to descending
    fireEvent.click(screen.getByText("Price").closest("th"));
    expect(onSort).toHaveBeenLastCalledWith({ key: "price", dir: "desc" });

    // Simulate parent updating sort state
    rerender(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Price"
              sortKey="price"
              sort={{ key: "price", dir: "desc" }}
              onSort={onSort}
            />
          </tr>
        </thead>
      </table>
    );

    // Click 3: clear
    fireEvent.click(screen.getByText("Price").closest("th"));
    expect(onSort).toHaveBeenLastCalledWith({ key: null, dir: "asc" });
  });
});
