import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken, isAuthenticated, parseJwt, fetchWithAuth } from "../../auth/auth";
import { slugToId, validatePhone } from "../../util/util";
import { PageContainer, Button, GlassCard, Spinner } from "../../components/ui";
import EnrolledPanel from "../../components/courses/EnrolledPanel";
import CourseInfoGrid from "../../components/courses/CourseInfoGrid";
import CourseDetailsBanner from "../../components/courses/CourseDetailsBanner";

const INTERVAL_LABELS = { month: "month", year: "year" };

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
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [participants, setParticipants] = useState([{ name: "", age: "" }]);

  useEffect(() => {
    if (!showEnrollModal) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowEnrollModal(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showEnrollModal]);

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
        body: JSON.stringify({
          email,
          phone: phone.trim(),
          participants: enrollParticipants,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enrollment failed");
      if (data.url) {
        window.location.href = data.url;
      } else {
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
      {course.images && course.images.length > 0 ? (
        <div className="page-section pt-6 md:pt-8">
          <img
            src={course.images[0]}
            alt={course.title}
            className="max-h-[35vh] md:max-h-[50vh] w-full rounded-[2rem] object-cover shadow-[var(--shadow-strong)]"
          />
        </div>
      ) : (
        <CourseDetailsBanner course={course} />
      )}

      <div className="page-section px-2 py-6 md:px-0 md:py-8">
        <div className={myEnrollment ? "grid grid-cols-1 md:grid-cols-3 gap-6" : ""}>
          <div className={myEnrollment ? "md:col-span-2" : ""}>
            <CourseInfoGrid
              course={course}
              spotsLeft={spotsLeft}
              isFull={isFull}
              actionButton={
                !myEnrollment && course.enrollmentOpen && !isFull ? (
                  !loggedIn ? (
                    <Link
                      to="/login"
                      className="btn btn-primary whitespace-nowrap hidden md:inline-flex"
                    >
                      Log in to enroll
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => setShowEnrollModal(true)}
                      className="whitespace-nowrap hidden md:inline-flex"
                    >
                      {course.price > 0
                        ? course.isSubscription
                          ? `Subscribe — £${course.price}/${INTERVAL_LABELS[course.billingInterval] || "mo"}`
                          : `Enroll — £${course.price}`
                        : "Enroll for Free"}
                    </Button>
                  )
                ) : !myEnrollment && isFull ? (
                  <span className="text-sm font-semibold text-red-500 bg-red-50 px-4 py-2 rounded-full whitespace-nowrap">
                    Full
                  </span>
                ) : null
              }
            />
          </div>
          {myEnrollment && (
            <div className="md:col-span-1">
              <GlassCard className="rounded-[1.75rem] shadow-xl h-full">
                <div className="card-body">
                  <EnrolledPanel
                    course={course}
                    enrollment={myEnrollment}
                    onChanged={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["my-enrollment", courseId],
                      })
                    }
                  />
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        <GlassCard className="rounded-[1.75rem] shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title text-xl text-base-content">About This Course</h2>
            <div className="prose max-w-none text-base-content/80 prose-headings:text-base-content prose-p:leading-7">
              <p>{course.description}</p>
            </div>
          </div>
        </GlassCard>
        <div className="mt-8 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="secondary" onClick={() => navigate("/courses")}>
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
            className="btn border-0 bg-[#1877F2] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#166FE5] hover:shadow-lg"
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

      {/* Floating enroll CTA — mobile only */}
      {!myEnrollment &&
        course.enrollmentOpen &&
        !isFull &&
        (!loggedIn ? (
          <Link
            to="/login"
            className="md:hidden fixed bottom-6 left-4 right-4 z-40 btn btn-primary shadow-xl text-base rounded-2xl py-3 text-center"
          >
            Log in to enroll
          </Link>
        ) : (
          <button
            onClick={() => setShowEnrollModal(true)}
            className="md:hidden fixed bottom-6 left-4 right-4 z-40 btn btn-primary shadow-xl text-base rounded-2xl py-3"
          >
            {course.price > 0
              ? course.isSubscription
                ? `Subscribe — £${course.price}/${INTERVAL_LABELS[course.billingInterval] || "month"}`
                : `Enroll — £${course.price}`
              : "Enroll for Free"}
          </button>
        ))}

      {/* Enrollment modal */}
      {showEnrollModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowEnrollModal(false)}
        >
          <div
            className="bg-base-100 rounded-[1.75rem] shadow-2xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-base-content">
                {course.isSubscription ? "Subscribe" : "Enroll"}
              </h2>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="p-2 text-base-content/50 hover:text-base-content rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {course.isSubscription && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700">
                £{course.price}/{INTERVAL_LABELS[course.billingInterval] || "month"} · cancel
                anytime
              </div>
            )}

            {!loggedIn ? (
              <div className="space-y-3">
                <p className="text-sm text-base-content/70 text-center">
                  You need an account to enroll in courses.
                </p>
                <Button variant="primary" className="w-full" onClick={() => navigate("/login")}>
                  Log in to enroll
                </Button>
                <p className="text-xs text-center text-base-content/50">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    placeholder="Email"
                    autoComplete="email"
                    className="glass-input text-sm w-full"
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40"
                    title="Using your account email"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (07...)"
                  autoComplete="tel"
                  className="glass-input text-sm w-full"
                />

                {!multiMode && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={participants[0]?.name || ""}
                      onChange={(e) => updateParticipant(0, "name", e.target.value)}
                      autoComplete="name"
                      className="glass-input text-sm !w-auto flex-1 min-w-0"
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      min="1"
                      value={participants[0]?.age || ""}
                      onChange={(e) => updateParticipant(0, "age", e.target.value)}
                      className="glass-input text-sm !w-20 min-w-0"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setMultiMode((m) => !m)}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={multiMode ? "M20 12H4" : "M12 4v16m8-8H4"}
                    />
                  </svg>
                  {multiMode ? "Single enrollment" : "Multiple people"}
                </button>

                {multiMode && (
                  <div className="space-y-2">
                    {participants.map((p, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Name *"
                          value={p.name}
                          onChange={(e) => updateParticipant(i, "name", e.target.value)}
                          autoComplete="name"
                          className="glass-input text-sm py-1.5 !w-auto flex-1 min-w-0"
                        />
                        <input
                          type="number"
                          placeholder="Age"
                          min="1"
                          value={p.age}
                          onChange={(e) => updateParticipant(i, "age", e.target.value)}
                          className="glass-input text-sm py-1.5 !w-20 min-w-0"
                        />
                        {participants.length > 1 && (
                          <button
                            onClick={() => removeParticipant(i)}
                            className="p-1.5 text-red-400 hover:text-red-600 cursor-pointer"
                            aria-label={`Remove participant ${i + 1}`}
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
                    <div className="flex items-center gap-3">
                      <button
                        onClick={addParticipant}
                        className="text-xs text-base-content/60 hover:text-base-content cursor-pointer"
                      >
                        + Add person
                      </button>
                      {course.price > 0 && (
                        <span className="text-xs text-base-content/50">
                          Total: £
                          {(
                            course.price * participants.filter((p) => p.name.trim()).length
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {enrollError && (
                  <p className="text-red-500 text-sm" role="alert">
                    {enrollError}
                  </p>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleEnroll}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <Spinner size="sm" />
                      <span className="ml-3">Redirecting to payment...</span>
                    </span>
                  ) : course.price > 0 ? (
                    course.isSubscription ? (
                      `Subscribe £${course.price}/${INTERVAL_LABELS[course.billingInterval] || "mo"}`
                    ) : multiMode ? (
                      `Pay £${(course.price * participants.filter((p) => p.name.trim()).length).toFixed(2)}`
                    ) : (
                      `Enroll — £${course.price}`
                    )
                  ) : (
                    "Enroll for Free"
                  )}
                </Button>
                {course.price > 0 && (
                  <p className="text-xs text-base-content/40 text-center">
                    Secure payment via Stripe
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
