import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken, isAuthenticated, parseJwt, fetchWithAuth } from "../../auth/auth";
import { slugToId, validatePhone } from "../../util/util";
import { PageContainer, Button, GlassCard, Spinner } from "../../components/ui";
import EnrolledPanel from "../../components/courses/EnrolledPanel";

const INTERVAL_LABELS = { month: "month", year: "year" };
const INTERVAL_ADJ = { month: "Monthly", year: "Yearly" };

const CATEGORY_COLORS = {
  Language: "from-primary to-secondary",
  Religious: "from-success to-accent",
  Academic: "from-primary to-secondary",
  Arts: "from-secondary to-primary",
  Other: "from-warning to-warning/70",
};

export default function CourseDetails() {
  const { courseSlug } = useParams();
  const courseId = slugToId(courseSlug);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const loggedIn = isAuthenticated();
  const [email, setEmail] = useState(() => {
    const token = getAuthToken();
    if (!token) return "";
    return parseJwt(token)?.email || "";
  });
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [multiMode, setMultiMode] = useState(false);
  const [participants, setParticipants] = useState([{ name: "", age: "" }]);

  const addParticipant = () => setParticipants((p) => [...p, { name: "", age: "" }]);
  const removeParticipant = (i) => setParticipants((p) => p.filter((_, idx) => idx !== i));
  const updateParticipant = (i, field, value) =>
    setParticipants((p) => {
      const updated = [...p];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });

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

  const { data: enrollmentData } = useQuery({
    queryKey: ["my-enrollment", courseId],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}courses/${courseId}/my-enrollment`
      );
      if (!res.ok) return { enrollment: null };
      return res.json();
    },
    enabled: loggedIn && !!courseId,
  });

  const myEnrollment = enrollmentData?.enrollment;

  const handleEnroll = async () => {
    setEnrollError("");
    if (!email) {
      setEnrollError("Please enter your email.");
      return;
    }
    if (!phone.trim()) {
      setEnrollError("Please enter your phone number.");
      return;
    }
    if (!validatePhone(phone)) {
      setEnrollError("Please enter a valid UK phone number (e.g. 07123456789 or +447123456789).");
      return;
    }
    try {
      setIsProcessing(true);
      const enrollParticipants = participants
        .filter((p) => p.name.trim())
        .map((p) => ({ ...p, email: p.email || email }));
      if (!enrollParticipants.length) {
        setEnrollError("Please enter at least one participant's name.");
        setIsProcessing(false);
        return;
      }

      const res = await fetchWithAuth(`${import.meta.env.VITE_DEV_URI}courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone: phone.trim(), participants: enrollParticipants }),
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

  if (isLoading)
    return (
      <PageContainer center>
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-base-content/50">Loading course details...</p>
        </div>
      </PageContainer>
    );
  if (error)
    return (
      <PageContainer center>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-red-100 text-center max-w-sm">
          <p className="text-red-500 font-medium mb-4">{error.message}</p>
        </div>
      </PageContainer>
    );

  const gradient = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.Other;
  const spotsLeft = course.maxEnrollment ? course.maxEnrollment - course.currentEnrollment : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <PageContainer>
      <Helmet>
        <title>{course.title} | ASC Courses</title>
        <meta
          name="description"
          content={course.shortDescription || course.description?.slice(0, 155)}
        />
      </Helmet>
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
        {course.images && course.images.length > 0 && (
          <img
            src={course.images[0]}
            alt={course.title}
            className="w-full aspect-[16/9] object-cover rounded-2xl shadow-xl mb-6"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left — details (second on mobile) */}
          <div className="md:col-span-2 md:order-1 space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-base-content mb-4">Course Details</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0\">
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
                    <p className="text-xs text-base-content/50 font-medium">Instructor</p>
                    <p className="text-base-content font-semibold">{course.instructor}</p>
                  </div>
                </div>

                {course.schedule && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
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
                      <p className="text-xs text-base-content/50 font-medium">Schedule</p>
                      <p className="text-base-content font-semibold">{course.schedule}</p>
                    </div>
                  </div>
                )}

                {(course.street || course.city) && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
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
                      <p className="text-xs text-base-content/50 font-medium">Location</p>
                      <p className="text-base-content font-semibold">
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
                      <p className="text-xs text-base-content/50 font-medium">Price</p>
                      <p className="text-base-content font-semibold">£{course.price}</p>
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
                      <p className="text-xs text-base-content/50 font-medium">Availability</p>
                      <p
                        className={`font-semibold ${isFull ? "text-red-600" : "text-base-content"}`}
                      >
                        {isFull ? "Full" : `${spotsLeft} spots remaining`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-base-content mb-3">About This Course</h2>
              <p className="text-base-content/80 leading-relaxed">{course.description}</p>
            </GlassCard>
          </div>

          {/* Right — enrollment (first on mobile) */}
          <div className="md:col-span-1 md:order-2">
            <GlassCard className="md:sticky md:top-20">
              <div className="p-6">
                {myEnrollment ? (
                  <EnrolledPanel
                    course={course}
                    enrollment={myEnrollment}
                    onChanged={() =>
                      queryClient.invalidateQueries({ queryKey: ["my-enrollment", courseId] })
                    }
                  />
                ) : (
                  /* ── Not enrolled — enroll form ── */
                  <>
                    <h2 className="text-xl font-bold text-base-content mb-4">
                      {course.price > 0
                        ? course.isSubscription
                          ? `Subscribe — £${course.price}/${INTERVAL_LABELS[course.billingInterval] || "month"}`
                          : `Enroll — £${course.price}`
                        : "Free Enrollment"}
                    </h2>
                    {course.isSubscription && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-700">
                        <p className="font-semibold mb-1">
                          {INTERVAL_ADJ[course.billingInterval] || "Monthly"} Subscription
                        </p>
                        <p>
                          You'll be charged £{course.price} every{" "}
                          {INTERVAL_LABELS[course.billingInterval] || "month"}. You can cancel
                          anytime from your profile, and you'll keep access until the end of your
                          current billing period — no partial refunds.
                        </p>
                      </div>
                    )}

                    {!course.enrollmentOpen || isFull ? (
                      <div className="bg-base-200 rounded-xl p-4 text-center text-base-content/50 text-sm">
                        {isFull
                          ? "This course is currently full."
                          : "Enrollment is currently closed."}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-base-content mb-1.5">
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

                        <div>
                          <label className="block text-sm font-medium text-base-content mb-1.5">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            className="glass-input"
                          />
                        </div>

                        {/* Participant details — always shown */}
                        {!multiMode && (
                          <div className="bg-base-200/50 rounded-xl p-3 space-y-2">
                            <p className="text-xs font-medium text-base-content/50">Your Details</p>
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
                          className="w-full text-xs text-base-content/50 hover:text-base-content flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-base-300/60 hover:bg-base-200/50 transition-all"
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
                            <p className="text-xs font-medium text-base-content/50">Participants</p>
                            {participants.map((p, i) => (
                              <div
                                key={i}
                                className="flex gap-2 items-start bg-base-200/50 rounded-xl p-2.5"
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
                              className="w-full text-xs py-1.5 rounded-xl border border-base-300 text-base-content/70 hover:bg-base-200 transition-all"
                            >
                              + Add another person
                            </button>
                            {course.price > 0 && (
                              <p className="text-xs text-base-content/50 text-center font-medium">
                                Total: £
                                {(
                                  course.price * participants.filter((p) => p.name.trim()).length
                                ).toFixed(2)}{" "}
                                ({participants.filter((p) => p.name.trim()).length} × £
                                {course.price})
                              </p>
                            )}
                          </div>
                        )}

                        {enrollError && (
                          <p className="text-red-500 text-sm bg-red-50/50 rounded-xl p-2">
                            {enrollError}
                          </p>
                        )}

                        <Button
                          variant="primary"
                          onClick={handleEnroll}
                          disabled={isProcessing}
                          className="w-full"
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
                              `Subscribe £${course.price}/${INTERVAL_LABELS[course.billingInterval] || "month"}`
                            ) : multiMode ? (
                              `Pay £${(course.price * participants.filter((p) => p.name.trim()).length).toFixed(2)} for ${participants.filter((p) => p.name.trim()).length} ${participants.filter((p) => p.name.trim()).length === 1 ? "person" : "people"}`
                            ) : (
                              "Enroll & Pay"
                            )
                          ) : (
                            "Enroll for Free"
                          )}
                        </Button>

                        {course.price > 0 && (
                          <p className="text-xs text-center text-base-content/50">
                            Secure payment via Stripe
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="mt-8 mb-4 flex items-center justify-between gap-3 flex-wrap">
          <Button variant="secondary" onClick={() => navigate(-1)}>
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
          <button
            onClick={() =>
              window.open("https://www.facebook.com/profile.php?id=100081705505202", "_blank")
            }
            className="btn bg-[#1877F2] hover:bg-[#166FE5] text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
            aria-label="Share on Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-1.5"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
            Share on Facebook
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
