const CATEGORY_COLORS = {
  Language: "from-primary to-secondary",
  Religious: "from-success to-accent",
  Academic: "from-primary to-secondary",
  Arts: "from-secondary to-primary",
  Other: "from-warning to-warning/70",
};

export default function CourseDetailsBanner({ course }) {
  const gradient = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.Other;

  return (
    <section className="page-section pt-6 md:pt-8">
      <div
        className={`bg-gradient-to-r ${gradient} rounded-[2rem] px-6 py-10 md:px-10 md:py-14 shadow-[var(--shadow-strong)] border border-white/8`}
      >
        <div className="mx-auto max-w-4xl text-center">
          <span className="section-kicker mb-5 border-white/10 bg-white/8 text-white">
            {course.category}
          </span>
          <h1 className="mb-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
            {course.title}
          </h1>
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Taught by {course.instructor}
          </p>
        </div>
      </div>
    </section>
  );
}
