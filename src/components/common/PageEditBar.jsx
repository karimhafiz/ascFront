import React from "react";
import FloatingBar from "./FloatingBar";

/**
 * Floating action bar for the Home/About inline page-content editor —
 * Cancel/Reset/Save controls, passed in as children so each page keeps
 * its own button set and logic.
 */
export default function PageEditBar({ children }) {
  return (
    <FloatingBar className="flex w-[min(1200px,calc(100%-2rem))] flex-wrap justify-end gap-2 rounded-3xl border border-white/60 bg-white/75 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-xl">
      {children}
    </FloatingBar>
  );
}
