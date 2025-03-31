import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const paymentId = searchParams.get("paymentId");
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);

  const email = searchParams.get("email"); // Get email from URL params

  useEffect(() => {
    // Fetch receipt details from the backend
    const fetchReceipt = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/payments/success?paymentId=${paymentId}&eventId=${eventId}&email=${encodeURIComponent(
            email
          )}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch receipt details");
        }
        const data = await response.json();
        setReceipt(data.receipt);
      } catch (error) {
        console.error("Error fetching receipt:", error);
      }
    };

    fetchReceipt();
  }, [paymentId, eventId, email]);

  const handleGoBack = () => {
    navigate(`/events/${eventId}`); // Redirect back to the event details page
  };

  const handlePrintTicket = () => {
    window.print(); // Trigger the browser's print functionality
  };

  if (!receipt) {
    return <p className="text-center text-gray-500">Loading receipt...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="card bg-base-100 shadow-lg p-6 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful
        </h1>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase! Your payment has been successfully
          processed.
        </p>
        <div className="text-left">
          <h2 className="text-2xl font-bold mb-4">Receipt Details</h2>
          <p>
            <strong>Payment ID:</strong> {receipt.paymentId}
          </p>
          <p>
            <strong>Event ID:</strong> {receipt.eventId}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>
          <p>
            <strong>Payer Name:</strong> {receipt.payer.first_name}{" "}
            {receipt.payer.last_name}
          </p>
          <p>
            <strong>Payer Email:</strong> {receipt.payer.email}
          </p>
          <p>
            <strong>Amount:</strong> {receipt.amount} {receipt.currency}
          </p>
          <p>
            <strong>Description:</strong> {receipt.description}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(receipt.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="card-actions justify-center mt-6">
          <button className="btn btn-primary" onClick={handlePrintTicket}>
            Print Ticket
          </button>
          <button className="btn btn-secondary" onClick={handleGoBack}>
            Back to Event
          </button>
        </div>
      </div>
    </div>
  );
}
