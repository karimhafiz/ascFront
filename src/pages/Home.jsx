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
    <div>
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
      <div className="hero bg-gray-100 py-12">
        <div className="hero-content flex flex-col-reverse lg:flex-row items-center gap-8">
          {/* Text Section */}
          <div className="text-center lg:text-left max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Welcome to Ayendah Sazan
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-6">
              We are a community-based organization in Leeds, dedicated to
              bringing people together through cultural and educational events.
              Join us to celebrate diversity and foster connections.
            </p>
            <button className="btn btn-primary px-6 py-3 text-base md:text-lg">
              Learn More
            </button>
          </div>

          {/* Image Section */}
          <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
            <img
              src="/heroImage.jpg"
              alt="Community Event"
              className="rounded-lg shadow-lg object-cover w-full h-auto"
            />
            <div className="absolute bottom-4 left-4 bg-primary text-white text-sm px-4 py-2 rounded-lg shadow-md">
              Inspiring Communities
            </div>
          </div>
        </div>
      </div>
      {/* Upcoming Events Section */}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Upcoming Events</h1>
        {upcomingEvents?.length === 0 ? (
          <p className="text-center text-gray-500">No upcoming events found.</p>
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
