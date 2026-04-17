import React from "react";

/**
 * Frosted-glass card container used throughout the app.
 * Wraps content with consistent glassmorphism styling.
 */
export default function GlassCard({ className = "", children, ...props }) {
  return (
    <div
      className={`glass-card rounded-2xl shadow-lg border border-white/30 backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
