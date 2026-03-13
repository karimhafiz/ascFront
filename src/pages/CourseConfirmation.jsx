import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function CourseConfirmation() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");
  const isFree = searchParams.get("free") === "true";

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
    <div className="min-h-screen bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-purple-900">Enrollment Confirmed!</h1>
          <p className="text-purple-600 mt-2">
            {isFree ? "You've been enrolled for free." : "Payment received. You're now enrolled."}
          </p>
        </div>

        {!isLoading && course && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
            <h2 className="text-lg font-bold text-purple-900 mb-3">{course.title}</h2>
            <div className="space-y-1.5 text-sm text-purple-700">
              {course.instructor && <p><span className="font-semibold">Instructor:</span> {course.instructor}</p>}
              {course.schedule && <p><span className="font-semibold">Schedule:</span> {course.schedule}</p>}
              {course.city && <p><span className="font-semibold">Location:</span> {[course.street, course.city].filter(Boolean).join(", ")}</p>}
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
          <h2 className="text-lg font-bold text-purple-900 mb-3">What's Next?</h2>
          <ul className="space-y-2 text-sm text-purple-700">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">•</span> Check your email for confirmation details</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">•</span> Arrive a few minutes early on your first session</li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">•</span> Bring any required materials mentioned by the instructor</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/profile" className="flex-1 btn bg-gradient-to-r from-purple-500 to-pink-500 border-none text-white hover:scale-105 transition-all rounded-xl shadow-md">
            View My Profile
          </Link>
          <Link to="/courses" className="flex-1 btn bg-white/60 border border-purple-200 text-purple-700 hover:bg-white/80 rounded-xl">
            Back to Courses
          </Link>
        </div>
      </div>
    </div>
  );
}