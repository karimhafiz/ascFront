import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// ─── OrderConfirmation ────────────────────────────────────────────────────────
// This page is where the user lands after a successful Stripe payment.
// The flow is:
//   1. User pays on Stripe's hosted page
//   2. Stripe redirects to our backend GET /payments/success?session_id=...
//   3. Backend verifies payment, creates Ticket in DB, updates event revenue
//   4. Backend redirects here: /order-confirmation?session_id=...
//   5. This page calls GET /payments/session/:sessionId to fetch order details
//      and displays a confirmation summary to the user.
//
// Stripe has already emailed the receipt to the customer automatically.
// ─────────────────────────────────────────────────────────────────────────────
export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found.");
      setLoading(false);
      return;
    }

    async function fetchSession() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_DEV_URI}payments/session/${sessionId}`
        );
        if (!response.ok) {
          throw new Error("Failed to retrieve order details.");
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  const handleAddToCalendar = () => {
    if (!order) return;
    const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `UID:${sessionId}`,
      `DTSTAMP:${now}`,
      `DTSTART:${now}`,
      `SUMMARY:Event Ticket`,
      `DESCRIPTION:Payment confirmed. Session: ${sessionId}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "event.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl flex flex-col items-center shadow-xl border border-white/30 backdrop-blur-md">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin mb-4"></div>
          <p className="text-purple-700 font-medium">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen flex items-center justify-center p-6">
        <div className="glass-card shadow-xl rounded-2xl p-10 text-center max-w-md border border-white/30 backdrop-blur-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            className="btn bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none"
            onClick={() => navigate("/")}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen py-8">
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="glass-card shadow-xl rounded-2xl p-8 border border-white/30 backdrop-blur-md">
          {/* Success icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-100/50 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Confirmed!</h1>
            <p className="text-purple-700">
              A receipt has been sent to your email by Stripe.
            </p>
          </div>

          {/* Order details */}
          {order && (
            <div className="bg-white/30 rounded-xl p-6 backdrop-blur-sm space-y-3 text-purple-800">
              <h2 className="text-xl font-bold text-indigo-700 mb-4">Order Summary</h2>
              <div className="flex justify-between">
                <span className="font-medium text-pink-700">Email</span>
                <span>{order.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-pink-700">Tickets</span>
                <span>{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-pink-700">Amount Paid</span>
                <span>£{Number(order.amountTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-pink-700">Status</span>
                <span className="text-green-600 font-semibold capitalize">{order.paymentStatus}</span>
              </div>
              <div className="pt-2 border-t border-white/30">
                <p className="text-xs text-gray-400 break-all">
                  Reference: {sessionId}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <button
              className="btn bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none hover:scale-105 transition-all duration-300 shadow-md"
              onClick={() => window.print()}
            >
              Print Confirmation
            </button>
            <button
              className="btn glass border border-purple-300 text-purple-700 hover:bg-purple-100/30 hover:scale-105 transition-all duration-300"
              onClick={handleAddToCalendar}
            >
              Add to Calendar
            </button>
            <button
              className="btn glass border border-indigo-300 text-indigo-700 hover:bg-indigo-100/30 hover:scale-105 transition-all duration-300"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}