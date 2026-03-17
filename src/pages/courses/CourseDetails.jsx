import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken, parseJwt, isAdmin, isModerator } from "../../auth/auth";
import { Link } from "react-router-dom";

const CATEGORY_COLORS = {
  Language: "from-blue-500 to-indigo-600",
  Religious: "from-emerald-500 to-teal-600",
  Academic: "from-purple-500 to-violet-600",
  Arts: "from-pink-500 to-rose-600",
  Other: "from-amber-500 to-orange-600",
};

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => {
    const token = getAuthToken();
    if (!token) return "";
    return parseJwt(token)?.email || "";
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [multiMode, setMultiMode] = useState(false);
  const [participants, setParticipants] = useState([{ name: "", age: "", email: "" }]);

  const addParticipant = () => setParticipants((p) => [...p, { name: "", age: "", email: "" }]);
  const removeParticipant = (i) => setParticipants((p) => p.filter((_, idx) => idx !== i));
  const updateParticipant = (i, field, value) =>
    setParticipants((p) => {
      const updated = [...p];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  const canManage = isAdmin() || isModerator();

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    },
  });

  const handleEnroll = async () => {
    setEnrollError("");
    if (!email) {
      setEnrollError("Please enter your email.");
      return;
    }
    try {
      setIsProcessing(true);
      const enrollParticipants = participants.filter((p) => p.name.trim());
      if (!enrollParticipants.length) {
        setEnrollError("Please enter at least one participant's name.");
        setIsProcessing(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_DEV_URI}courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ email, participants: enrollParticipants }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enrollment failed");
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Free course enrolled directly
        navigate(`/course-confirmation?courseId=${courseId}&free=true`);
      }
    } catch (err) {
      setEnrollError(err.message);
      setIsProcessing(false);
    }
  };

  if (isLoading) return <p className="text-center text-gray-500 mt-20">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-20">Error: {error.message}</p>;

  const gradient = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.Other;
  const spotsLeft = course.maxEnrollment ? course.maxEnrollment - course.currentEnrollment : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} text-white p-8 md:p-14 shadow-lg`}>
        <div className="container mx-auto">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {course.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{course.title}</h1>
          <p className="text-white/80 text-lg">Taught by {course.instructor}</p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {canManage && (
          <div className="flex gap-3 mb-6">
            <Link
              to={`/courses/${courseId}/edit`}
              className="btn btn-sm bg-white/60 border border-purple-200 text-purple-700 rounded-xl hover:bg-white/80"
            >
              Edit Course
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left — details */}
          <div className="md:col-span-2 space-y-6">
            {course.images && course.images.length > 0 && (
              <img
                src={course.images[0]}
                alt={course.title}
                className="w-full h-64 object-cover rounded-2xl shadow-xl"
              />
            )}

            <div className="glass-card rounded-2xl shadow-xl border border-white/30 backdrop-blur-md p-6">
              <h2 className="text-xl font-bold text-pink-700 mb-4">Course Details</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
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
                    <p className="text-xs text-purple-500 font-medium">Instructor</p>
                    <p className="text-purple-900 font-semibold">{course.instructor}</p>
                  </div>
                </div>

                {course.schedule && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
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
                      <p className="text-xs text-purple-500 font-medium">Schedule</p>
                      <p className="text-purple-900 font-semibold">{course.schedule}</p>
                    </div>
                  </div>
                )}

                {(course.street || course.city) && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
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
                      <p className="text-xs text-purple-500 font-medium">Location</p>
                      <p className="text-purple-900 font-semibold">
                        {[course.street, course.city, course.postCode].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {course.price > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
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
                      <p className="text-xs text-purple-500 font-medium">Price</p>
                      <p className="text-purple-900 font-semibold">£{course.price}</p>
                    </div>
                  </div>
                )}

                {spotsLeft !== null && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
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
                      <p className="text-xs text-purple-500 font-medium">Availability</p>
                      <p className={`font-semibold ${isFull ? "text-red-600" : "text-purple-900"}`}>
                        {isFull ? "Full" : `${spotsLeft} spots remaining`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl shadow-xl border border-white/30 backdrop-blur-md p-6">
              <h2 className="text-xl font-bold text-indigo-700 mb-3">About This Course</h2>
              <p className="text-purple-900 leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* Right — enrollment */}
          <div className="md:col-span-1">
            <div className="glass-card shadow-xl border border-white/30 backdrop-blur-md rounded-2xl sticky top-4">
              <div className="p-6">
                <h2 className="text-xl font-bold text-pink-700 mb-4">
                  {course.price > 0
                    ? course.isSubscription
                      ? `Subscribe — £${course.price}/month`
                      : `Enroll — £${course.price}`
                    : "Free Enrollment"}
                </h2>
                {course.isSubscription && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-700">
                    <p className="font-semibold mb-1">📅 Monthly Subscription</p>
                    <p>
                      You'll be charged £{course.price} every month. You can cancel anytime from
                      your profile, and you'll keep access until the end of your current billing
                      period — no partial refunds.
                    </p>
                  </div>
                )}

                {!course.enrollmentOpen || isFull ? (
                  <div className="bg-purple-50 rounded-xl p-4 text-center text-purple-400 text-sm">
                    {isFull ? "This course is currently full." : "Enrollment is currently closed."}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1.5">
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="glass-input"
                      />
                    </div>

                    {/* Participant details — always shown */}
                    {!multiMode && (
                      <div className="bg-purple-50/50 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-medium text-purple-600">Your Details</p>
                        <input
                          type="text"
                          placeholder="Your name *"
                          value={participants[0]?.name || ""}
                          onChange={(e) => updateParticipant(0, "name", e.target.value)}
                          className="glass-input text-sm py-1.5"
                        />
                        <input
                          type="number"
                          placeholder="Age (optional)"
                          min="1"
                          value={participants[0]?.age || ""}
                          onChange={(e) => updateParticipant(0, "age", e.target.value)}
                          className="glass-input text-sm py-1.5"
                        />
                      </div>
                    )}

                    {/* Multi-person toggle */}
                    <button
                      type="button"
                      onClick={() => setMultiMode((m) => !m)}
                      className="w-full text-xs text-purple-500 hover:text-purple-700 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-purple-200/60 hover:bg-purple-50/50 transition-all"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={multiMode ? "M20 12H4" : "M12 4v16m8-8H4"}
                        />
                      </svg>
                      {multiMode ? "Back to single enrollment" : "Enroll multiple people"}
                    </button>

                    {/* Multi-person form */}
                    {multiMode && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-purple-600">Participants</p>
                        {participants.map((p, i) => (
                          <div
                            key={i}
                            className="flex gap-2 items-start bg-purple-50/50 rounded-xl p-2.5"
                          >
                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                placeholder="Name *"
                                value={p.name}
                                onChange={(e) => updateParticipant(i, "name", e.target.value)}
                                className="glass-input text-sm py-1.5"
                              />
                              <input
                                type="number"
                                placeholder="Age"
                                min="1"
                                value={p.age}
                                onChange={(e) => updateParticipant(i, "age", e.target.value)}
                                className="glass-input text-sm py-1.5"
                              />
                              <input
                                type="email"
                                placeholder="Email (optional)"
                                value={p.email}
                                onChange={(e) => updateParticipant(i, "email", e.target.value)}
                                className="glass-input text-sm py-1.5"
                              />
                            </div>
                            {participants.length > 1 && (
                              <button
                                onClick={() => removeParticipant(i)}
                                className="text-red-400 hover:text-red-600 mt-1 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addParticipant}
                          className="w-full text-xs py-1.5 rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 transition-all"
                        >
                          + Add another person
                        </button>
                        {course.price > 0 && (
                          <p className="text-xs text-purple-500 text-center font-medium">
                            Total: £
                            {(
                              course.price * participants.filter((p) => p.name.trim()).length
                            ).toFixed(2)}{" "}
                            ({participants.filter((p) => p.name.trim()).length} × £{course.price})
                          </p>
                        )}
                      </div>
                    )}

                    {enrollError && (
                      <p className="text-red-500 text-sm bg-red-50/50 rounded-xl p-2">
                        {enrollError}
                      </p>
                    )}

                    <button
                      onClick={handleEnroll}
                      disabled={isProcessing}
                      className="btn bg-gradient-to-r from-pink-500 to-purple-600 w-full border-none text-white hover:scale-105 transition-all duration-300 shadow-md rounded-xl"
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Redirecting...
                        </span>
                      ) : course.price > 0 ? (
                        course.isSubscription ? (
                          `Subscribe £${course.price}/month`
                        ) : multiMode ? (
                          `Pay £${(course.price * participants.filter((p) => p.name.trim()).length).toFixed(2)} for ${participants.filter((p) => p.name.trim()).length} ${participants.filter((p) => p.name.trim()).length === 1 ? "person" : "people"}`
                        ) : (
                          "Enroll & Pay"
                        )
                      ) : (
                        "Enroll for Free"
                      )}
                    </button>

                    {course.price > 0 && (
                      <p className="text-xs text-center text-gray-400">
                        🔒 Secure payment via Stripe
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="btn glass border border-purple-300 text-purple-700 hover:bg-purple-100/30 hover:scale-105 transition-all duration-300 rounded-xl"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Courses
          </button>
        </div>
      </div>
    </div>
  );
}
