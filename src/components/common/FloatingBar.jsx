import React from "react";

/**
 * Pins its children near the top of the viewport via `position: fixed`, so
 * the bar floats over scrolling content instead of shifting it around.
 *
 * Renders an invisible clone of the same content in normal document flow
 * first, so the page still reserves natural space for the bar (matching its
 * actual rendered height, whatever that is) without a fixed/guessed padding
 * value on every consuming page — the real bar then floats on top of that
 * reserved gap and everything below it.
 *
 * Positioning-only — visual styling (background, border, padding, width) is
 * left entirely to `className`/children so different bars can look different.
 */
export default function FloatingBar({ children, className = "", top = "top-20" }) {
  return (
    <>
      <div className={`invisible mx-auto ${className}`} aria-hidden="true">
        {children}
      </div>
      <div className={`fixed inset-x-0 z-40 mx-auto ${top} ${className}`}>{children}</div>
    </>
  );
}
