import { useNavigate, useRouteLoaderData } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import EventCard from "../components/EventCard";

export default function Home() {
  const { events } = useRouteLoaderData("root");

  const currentDate = new Date();

  const upcomingEvents = events.filter(
    (event) => new Date(event.date) >= currentDate
  );
  console.log(events);
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
        <meta property="og:image" content="https://example.com/logo.png" />
        <meta property="og:url" content="https://example.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ayendah Sazan - Home" />
        <meta
          name="twitter:description"
          content="Welcome to Ayendah Sazan, a community-based organization in Leeds dedicated to bringing people together through cultural and educational events."
        />
        <meta name="twitter:image" content="https://example.com/logo.png" />
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 text-gray-900">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome to Ayendah Sazan Community
        </h1>
        <p className="text-lg max-w-3xl text-center mb-6">
          We are a community-based organization in Leeds, dedicated to bringing
          people together through cultural and educational events.
        </p>

        {/* Eid Event Section */}
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-center mb-6">
            Upcoming Events
          </h1>
          {upcomingEvents?.length === 0 ? (
            <p className="text-center text-gray-500">
              No upcoming events found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents?.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
