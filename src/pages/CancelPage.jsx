import React from "react";
import { useNavigate } from "react-router-dom";

export default function CancelPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/"); // Redirect to the home page or events page
  };
  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen flex items-center justify-center p-6">
      <div className="glass-card shadow-xl rounded-2xl p-10 text-center max-w-md border border-white/30 backdrop-blur-md">
        <div className="w-20 h-20 rounded-full bg-red-100/50 flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Transaction Cancelled
        </h1>
        <p className="text-purple-700 mb-8">
          Your transaction has been cancelled. If this was a mistake, you can
          try again.
        </p>
        <button
          className="btn bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none hover:scale-105 transition-all duration-300 shadow-md"
          onClick={handleGoBack}
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
}
