import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui";

export default function CourseConfirmation() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");
  const isFree = searchParams.get("free") === "true";
  const isReactivated = searchParams.get("reactivated") === "true";

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!courseId,
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-base-content">
            {isReactivated ? "Subscription Reactivated!" : "Enrollment Confirmed!"}
          </h1>
          <p className="text-base-content/70 mt-2">
            {isReactivated
              ? "Your subscription is no longer cancelled. You're all set."
              : isFree
                ? "You've been enrolled for free."
                : "Payment received. You're now enrolled."}
          </p>
          {!isLoading && course?.isSubscription && !isReactivated && (
            <p className="text-base-content/50 text-sm mt-1">
              Your {course.billingInterval === "year" ? "yearly" : "monthly"} subscription is now
              active. Manage it anytime from your profile.
            </p>
          )}
        </div>

        {!isLoading && course && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
            <h2 className="text-lg font-bold text-base-content mb-3">{course.title}</h2>
            <div className="space-y-1.5 text-sm text-base-content/70">
              {course.instructor && (
                <p>
                  <span className="font-semibold">Instructor:</span> {course.instructor}
                </p>
              )}
              {course.schedule && (
                <p>
                  <span className="font-semibold">Schedule:</span> {course.schedule}
                </p>
              )}
              {course.city && (
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {[course.street, course.city].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
          <h2 className="text-lg font-bold text-base-content mb-3">What's Next?</h2>
          <ul className="space-y-2 text-sm text-base-content/70">
            <li className="flex items-start gap-2">
              <span className="text-base-content/50 mt-0.5">•</span> Check your email for
              confirmation details
            </li>
            <li className="flex items-start gap-2">
              <span className="text-base-content/50 mt-0.5">•</span> Arrive a few minutes early on
              your first session
            </li>
            <li className="flex items-start gap-2">
              <span className="text-base-content/50 mt-0.5">•</span> Bring any required materials
              mentioned by the instructor
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" to="/profile" className="flex-1">
            View My Profile
          </Button>
          <Button variant="secondary" to="/courses" className="flex-1">
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
            Back to Courses
          </Button>
        </div>
      </div>
    </div>
  );
}
