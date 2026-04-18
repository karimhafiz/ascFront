import React from "react";

/**
 * Elevated surface container used across the app.
 */
export default function GlassCard({ className = "", children, ...props }) {
  return (
    <div
      className={`glass-card rounded-3xl border border-[var(--surface-border)] shadow-[var(--shadow-soft)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
