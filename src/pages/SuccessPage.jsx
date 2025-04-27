import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const paymentId = searchParams.get("paymentId");
  const email = searchParams.get("email"); // Get email from URL params
  const navigate = useNavigate();

  // Fetch receipt details using React Query
  const {
    data: receipt,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["receipt", paymentId, eventId, email],
    queryFn: async () => {
      const response = await fetch(
        `${
          import.meta.env.VITE_DEV_URI
        }payments/success?paymentId=${paymentId}&eventId=${eventId}&email=${encodeURIComponent(
          email
        )}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch receipt details");
      }
      const data = await response.json();

      // Validate receipt data
      if (!data.receipt || !data.receipt.paymentId || !data.receipt.eventId) {
        throw new Error("Incomplete receipt data received");
      }

      return data.receipt;
    },
    retry: false, // Disable retries for this query
  });

  const handleGoBack = () => {
    navigate(`/events/${eventId}`); // Redirect back to the event details page
  };

  const handlePrintTicket = () => {
    window.print(); // Trigger the browser's print functionality
  };

  // Helper to generate ICS file content
  const generateICS = () => {
    if (!receipt) return "";
    // Use event date if available, otherwise fallback to receipt.createdAt
    const eventDate = receipt.date || receipt.createdAt || Date.now();
    const dtStart =
      new Date(eventDate).toISOString().replace(/[-:]/g, "").split(".")[0] +
      "Z";
    // For a single-day event, end = start + 2 hours (or same as start)
    const dtEnd =
      new Date(new Date(eventDate).getTime() + 2 * 60 * 60 * 1000)
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";
    const summary = receipt.description || "Event";
    const uid = receipt.paymentId || Date.now();
    const location = receipt.location || receipt.city || "";
    const description = `Payment ID: ${receipt.paymentId}\n${summary}`;
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//YourApp//EN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtStart}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  };

  const handleAddToCalendar = () => {
    const icsContent = generateICS();
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "event.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Display a loading message while fetching data
  if (isLoading) {
    return <p className="text-center text-gray-500">Loading receipt...</p>;
  }

  // Display an error message if there's an error
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="card bg-base-100 shadow-lg p-6 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error.message}</p>
          <button className="btn btn-secondary" onClick={handleGoBack}>
            Back to Event
          </button>
        </div>
      </div>
    );
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
            <strong>Payer Name:</strong> {receipt.payer?.first_name || "N/A"}{" "}
            {receipt.payer?.last_name || "N/A"}
          </p>
          <p>
            <strong>Payer Email:</strong> {receipt.payer?.email || "N/A"}
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
          <button className="btn btn-accent" onClick={handleAddToCalendar}>
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
