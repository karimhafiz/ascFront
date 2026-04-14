export default function EventDetailsBanner({ event }) {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 md:p-12 shadow-lg backdrop-blur-sm">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-2">{event.title}</h1>
        {event.organizer && (
          <p className="text-center text-lg">
            <span className="flex items-center justify-center">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {event.organizer}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
