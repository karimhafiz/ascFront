import React from "react";
import { useNavigate } from "react-router-dom";

export default function CancelPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/"); // Redirect to the home page or events page
  };

  return (
    <div className="container mx-auto p-6">
      <div className="card bg-base-100 shadow-lg p-6 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Transaction Cancelled
        </h1>
        <p className="text-gray-700 mb-6">
          Your transaction has been cancelled. If this was a mistake, you can
          try again.
        </p>
        <button className="btn btn-primary" onClick={handleGoBack}>
          Go Back to Home
        </button>
      </div>
    </div>
  );
}
