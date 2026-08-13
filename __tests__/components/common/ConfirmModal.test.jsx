import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfirmModal from "../../../src/components/common/ConfirmModal";

describe("ConfirmModal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <ConfirmModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the default title and confirm label when open", () => {
    render(<ConfirmModal isOpen onConfirm={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("renders custom title, message, and confirm label", () => {
    render(
      <ConfirmModal
        isOpen
        title="Ban user?"
        message="This will prevent them from logging in."
        confirmLabel="Ban"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("Ban user?")).toBeInTheDocument();
    expect(screen.getByText("This will prevent them from logging in.")).toBeInTheDocument();
    expect(screen.getByText("Ban")).toBeInTheDocument();
  });

  it("does not render a message paragraph when none is provided", () => {
    const { container } = render(
      <ConfirmModal isOpen onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(container.querySelector("p")).toBeNull();
  });

  it("calls onCancel when the backdrop is clicked", () => {
    const onCancel = jest.fn();
    const { container } = render(<ConfirmModal isOpen onConfirm={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(container.firstChild);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not call onCancel when the panel itself is clicked (stopPropagation)", () => {
    const onCancel = jest.fn();
    render(<ConfirmModal isOpen title="Ban user?" onConfirm={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Ban user?"));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel when the Cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(<ConfirmModal isOpen onConfirm={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when the confirm button is clicked", () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmModal isOpen confirmLabel="Delete" onConfirm={onConfirm} onCancel={jest.fn()} />
    );
    fireEvent.click(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("does not apply danger styling by default", () => {
    render(
      <ConfirmModal isOpen confirmLabel="Delete" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(screen.getByText("Delete")).not.toHaveClass("bg-error/10");
  });
});
