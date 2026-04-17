import React from "react";
import { Button, PageContainer, GlassCard } from "../components/ui";

export default function ErrorPage({ error }) {
  return (
    <PageContainer center>
      <GlassCard className="p-10 text-center max-w-lg">
        <div className="  w-24 h-24 rounded-full bg-red-100/50 flex items-center justify-center mx-auto w-full mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-base-content mb-4">Oops!</h1>
        <p className="text-xl text-base-content/70 mb-6">Something went wrong.</p>
        {error && (
          <div className="bg-white/30 p-4 rounded-xl text-left text-red-700 mb-6 backdrop-blur-sm">
            <p className="font-medium">Error details:</p>
            <p className="mt-2">{error.message || "Unknown error"}</p>
          </div>
        )}
        <Button variant="primary" onClick={() => (window.location.href = "/")}>
          Return to Home
        </Button>
      </GlassCard>
    </PageContainer>
  );
}
