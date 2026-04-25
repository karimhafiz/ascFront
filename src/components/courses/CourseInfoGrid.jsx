import { GlassCard } from "../ui";

const INTERVAL_LABELS = { month: "month", year: "year" };

export default function CourseInfoGrid({ course, spotsLeft, isFull, actionButton }) {
  return (
    <GlassCard className="rounded-[1.75rem] shadow-xl">
      <div className="card-body">
        <div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-between">
          <h2 className="card-title text-xl text-base-content justify-center md:justify-start">
            {course.title}
          </h2>
          {actionButton && (
            <div className="w-full md:w-auto [&>*]:w-full [&>*]:md:w-auto">{actionButton}</div>
          )}
        </div>
        <div className="space-y-4 mt-2">
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-primary to-secondary text-white p-3 rounded-xl mr-4 shadow-md flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content">Instructor</h3>
              <p className="text-base-content/70">{course.instructor}</p>
            </div>
          </div>

          {course.schedule && (
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-primary to-secondary text-white p-3 rounded-xl mr-4 shadow-md flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">Schedule</h3>
                <p className="text-base-content/70">{course.schedule}</p>
              </div>
            </div>
          )}

          {(course.street || course.city) && (
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-primary to-secondary text-white p-3 rounded-xl mr-4 shadow-md flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">Location</h3>
                <p className="text-base-content/70">
                  {[course.street, course.city, course.postCode].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          )}

          {course.price > 0 && (
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-3 rounded-xl mr-4 shadow-md flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">Price</h3>
                <p className="text-base-content/70">
                  £{course.price}
                  {course.isSubscription &&
                    `/${INTERVAL_LABELS[course.billingInterval] || "month"}`}
                </p>
              </div>
            </div>
          )}

          {spotsLeft !== null && (
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-3 rounded-xl mr-4 shadow-md flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">Availability</h3>
                <p className={`${isFull ? "text-red-600" : "text-base-content/70"}`}>
                  {isFull ? "Full" : `${spotsLeft} spots remaining`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
