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
    return (
      <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl flex flex-col items-center shadow-xl border border-white/30 backdrop-blur-md">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin mb-4"></div>
          <p className="text-purple-700 font-medium">Loading receipt...</p>
        </div>
      </div>
    );
  }

  // Display an error message if there's an error
  if (error) {
    return (
      <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen py-8">
        <div className="container mx-auto p-6">
          <div className="glass-card bg-red-100/30 shadow-xl rounded-2xl p-8 text-center border border-red-200/50 backdrop-blur-md">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-red-700 mb-6">{error.message}</p>
            <button
              className="btn bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none hover:scale-105 transition-all duration-300 shadow-md"
              onClick={handleGoBack}
            >
              Back to Event
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen py-8">
      <div className="container mx-auto p-6">
        <div className="glass-card shadow-xl rounded-2xl p-8 border border-white/30 backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100/50 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Payment Successful
            </h1>
            <p className="text-purple-700 mb-6">
              Thank you for your purchase! Your payment has been successfully
              processed.
            </p>
          </div>

          <div className="bg-white/30 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">
              Receipt Details
            </h2>
            <div className="space-y-2 text-purple-800">
              <p>
                <strong className="text-pink-700">Payment ID:</strong>{" "}
                {receipt.paymentId}
              </p>
              <p>
                <strong className="text-pink-700">Event ID:</strong>{" "}
                {receipt.eventId}
              </p>
              <p>
                <strong className="text-pink-700">Email:</strong> {email}
              </p>
              <p>
                <strong className="text-pink-700">Payer Name:</strong>{" "}
                {receipt.payer?.first_name || "N/A"}{" "}
                {receipt.payer?.last_name || "N/A"}
              </p>
              <p>
                <strong className="text-pink-700">Payer Email:</strong>{" "}
                {receipt.payer?.email || "N/A"}
              </p>
              <p>
                <strong className="text-pink-700">Amount:</strong>{" "}
                {receipt.amount} {receipt.currency}
              </p>
              <p>
                <strong className="text-pink-700">Description:</strong>{" "}
                {receipt.description}
              </p>
              <p>
                <strong className="text-pink-700">Date:</strong>{" "}
                {new Date(receipt.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="card-actions justify-center mt-8 space-x-4">
            <button
              className="btn bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none hover:scale-105 transition-all duration-300 shadow-md"
              onClick={handlePrintTicket}
            >
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Ticket
            </button>
            <button
              className="btn glass border border-purple-300 text-purple-700 hover:bg-purple-100/30 hover:scale-105 transition-all duration-300"
              onClick={handleGoBack}
            >
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
              Back to Event
            </button>
            <button
              className="btn bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none hover:scale-105 transition-all duration-300 shadow-md"
              onClick={handleAddToCalendar}
            >
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
