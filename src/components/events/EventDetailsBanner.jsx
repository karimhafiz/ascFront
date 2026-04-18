export default function EventDetailsBanner({ event }) {
  return (
    <section className="page-section pt-6 md:pt-8">
      <div className="hero-panel rounded-[2rem] px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <span className="section-kicker mb-5 border-white/10 bg-white/8 text-white">
            Event Overview
          </span>
          <h1 className="mb-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
            {event.title}
          </h1>
          {event.organizer && (
            <p className="mx-auto flex max-w-2xl items-center justify-center gap-2 text-base text-neutral-content/80 md:text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              Organized by {event.organizer}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
