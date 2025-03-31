import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";

async function loadEvents(eventId) {
  const response = await fetch(`http://localhost:5000/api/events/${eventId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch event details");
  }
  const resData = await response.json();
  return resData || [];
}

export async function eventDetailLoader({ params }) {
  const { eventId } = params;
  return loadEvents(eventId);
}

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1); // Default ticket quantity
  const [email, setEmail] = useState(""); // User's email

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  // Fetch event details using React Query
  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      return response.json();
    },
  });

  const handleBuyTickets = async () => {
    if (!email) {
      alert("Please enter your email to proceed.");
      return;
    }

    const response = await fetch("http://localhost:5000/api/payments/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: event.ticketPrice * quantity, // Calculate total price
        eventId: eventId,
        email: email, // Include user's email
        quantity: quantity, // Include ticket quantity
      }),
    });

    const data = await response.json();
    if (data.link) {
      window.location.href = data.link; // Redirect to PayPal
    }
  };

  if (isLoading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500">Error: {error.message}</p>;

  // Check if the event date is in the past
  const isEventInPast = new Date(event.date) < new Date();

  return (
    <div className="container mx-auto p-6">
      {/* Hero Section */}
      <div className="relative w-full h-96 bg-gray-800">
        <img
          src={event.images?.[0] || "https://dummyimage.com/1280x720/fff/aaa"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-75"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-5xl font-bold">{event.title}</h1>
          <p className="text-lg mt-4">{event.shortDescription}</p>
        </div>
      </div>

      {/* Event Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Event Details</h2>
          <p className="text-gray-700 mb-4">{event.longDescription}</p>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold">Date:</span>{" "}
              {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Time:</span> {event.openingTime}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Location:</span> {event.street},{" "}
              {event.city}, {event.postCode}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Ticket Price:</span> $
              {event.ticketPrice}
            </p>
          </div>
        </div>

        {/* Ticket Purchase Section */}
        {!isEventInPast ? (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Purchase Tickets</h2>
            <div className="mt-4">
              <label className="block text-lg font-semibold mb-2">
                Ticket Quantity:
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input input-bordered w-full max-w-xs"
              />
            </div>
            <div className="mt-4">
              <label className="block text-lg font-semibold mb-2">
                Your Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full max-w-xs"
                placeholder="Enter your email"
              />
            </div>
            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary w-full"
                onClick={handleBuyTickets}
              >
                Buy Tickets
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
            <p className="text-lg font-semibold">
              This event has already occurred. Ticket purchases are no longer
              available.
            </p>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button className="btn btn-secondary" onClick={handleBack}>
          Back to Events
        </button>
      </div>
    </div>
  );
}
