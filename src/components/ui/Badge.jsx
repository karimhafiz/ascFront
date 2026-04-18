import React from "react";

const presets = {
  primary: "badge border-0 bg-primary/10 text-primary",
  secondary: "badge border-0 bg-secondary/15 text-secondary",
  accent: "badge border-0 bg-accent/12 text-accent",
  info: "badge border-0 bg-info/12 text-info",
  success: "badge border-0 bg-success/12 text-success",
  warning: "badge border-0 bg-warning/16 text-warning-content",
  error: "badge border-0 bg-error/12 text-error",
  ghost: "badge border border-base-300 bg-white/70 text-base-content/70",
};

export default function Badge({ color = "primary", className = "", children, ...props }) {
  return (
    <span
      className={`${presets[color] || presets.primary} rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
