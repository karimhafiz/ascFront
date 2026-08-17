import React from "react";

export default function PageContainer({ center, className = "", children }) {
  return (
    <div
      className={`min-h-[calc(100dvh-var(--navbar-height))] ${center ? "flex items-center justify-center" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
