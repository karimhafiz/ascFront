import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, PageContainer, GlassCard } from "../../components/ui";

export default function CancelPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/"); // Redirect to the home page or events page
  };
  return (
    <PageContainer center>
      <GlassCard className="p-10 text-center max-w-md">
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
        <h1 className="text-3xl font-bold text-red-600 mb-4">Transaction Cancelled</h1>
        <p className="text-base-content mb-8">
          Your transaction has been cancelled. If this was a mistake, you can try again.
        </p>
        <Button variant="secondary" onClick={handleGoBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Go Back to Home
        </Button>
      </GlassCard>
    </PageContainer>
  );
}
