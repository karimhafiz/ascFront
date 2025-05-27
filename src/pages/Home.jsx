import React from "react";
import { useRouteLoaderData } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import EventCard from "../components/EventCard";

export default function Home() {
  const { events } = useRouteLoaderData("root");

  const currentDate = new Date();

  const upcomingEvents = events.filter(
    (event) => new Date(event.date) >= currentDate
  );
  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen">
      <Helmet>
        <title>Ayendah Sazan - Home</title>
        <meta
          name="description"
          content="Welcome to Ayendah Sazan, a community-based organization in Leeds dedicated to bringing people together through cultural and educational events."
        />
        <meta property="og:title" content="Ayendah Sazan - Home" />
        <meta
          property="og:description"
          content="Welcome to Ayendah Sazan, a community-based organization in Leeds dedicated to bringing people together through cultural and educational events."
        />
        <meta property="og:image" content="/heroImage.jpg" />
        <meta property="og:url" content="https://example.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ayendah Sazan - Home" />
        <meta
          name="twitter:description"
          content="Welcome to Ayendah Sazan, a community-based organization in Leeds dedicated to bringing people together through cultural and educational events."
        />
        <meta name="twitter:image" content="/heroImage.jpg" />
      </Helmet>
      {/* Hero Section */}
      <div className="hero bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 py-16">
        <div className="hero-content flex flex-col-reverse lg:flex-row items-center gap-12">
          {/* Text Section */}
          <div className="text-center lg:text-left max-w-lg glass-card p-8 rounded-2xl backdrop-blur-md border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4">
              Welcome to Ayendah Sazan
            </h1>
            <p className="text-base md:text-lg text-indigo-700 mb-6">
              We are a community-based organization in Leeds, dedicated to
              bringing people together through cultural and educational events.
              Join us to celebrate diversity and foster connections.
            </p>
            <button className="btn bg-gradient-to-r from-pink-500 to-purple-600 border-none text-white px-6 py-3 text-base md:text-lg hover:scale-105 transition-all duration-300 shadow-md rounded-xl">
              Learn More
            </button>
          </div>

          {/* Image Section */}
          <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg transform hover:rotate-1 transition-all duration-500">
            <img
              src="/heroImage.jpg"
              alt="Community Event"
              className="rounded-2xl shadow-xl object-cover w-full h-auto ring-4 ring-white/50"
            />
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm">
              Inspiring Communities
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Upcoming Events Section */}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-700">
          Upcoming Events
        </h1>
        {upcomingEvents?.length === 0 ? (
          <div className="glass-card p-8 text-center rounded-xl backdrop-blur-md shadow-xl">
            <p className="text-purple-600">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents?.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
