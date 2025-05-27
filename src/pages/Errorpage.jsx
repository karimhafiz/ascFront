import React from "react";

export default function ErrorPage({ error }) {
  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen flex items-center justify-center p-6">
      <div className="glass-card shadow-xl rounded-2xl p-10 text-center max-w-lg border border-white/30 backdrop-blur-md">
        <div className="w-24 h-24 rounded-full bg-red-100/50 flex items-center justify-center mx-auto mb-6">
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
        <h1 className="text-4xl font-bold text-pink-700 mb-4">Oops!</h1>
        <p className="text-xl text-purple-700 mb-6">Something went wrong.</p>
        {error && (
          <div className="bg-white/30 p-4 rounded-xl text-left text-red-700 mb-6 backdrop-blur-sm">
            <p className="font-medium">Error details:</p>
            <p className="mt-2">{error.message || "Unknown error"}</p>
          </div>
        )}
        <button
          className="btn bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none hover:scale-105 transition-all duration-300 shadow-md"
          onClick={() => (window.location.href = "/")}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
