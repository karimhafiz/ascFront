import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken, isAuthenticated, parseJwt, isAdmin, isModerator } from "../../auth/auth";
import { slugToId, validatePhone } from "../../util/util";
import { PageContainer, Button, GlassCard } from "../../components/ui";

const INTERVAL_LABELS = { month: "month", year: "year" };
const INTERVAL_ADJ = { month: "Monthly", year: "Yearly" };

const CATEGORY_COLORS = {
  Language: "from-primary to-secondary",
  Religious: "from-success to-accent",
  Academic: "from-primary to-secondary",
  Arts: "from-secondary to-primary",
  Other: "from-warning to-warning/70",
};

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  paid: "bg-blue-100 text-blue-700",
  free: "bg-teal-100 text-teal-700",
  past_due: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS = {
  active: "Active Subscription",
  paid: "Enrolled",
  free: "Enrolled (Free)",
  past_due: "Past Due",
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
  const [participants, setParticipants] = useState([{ name: "", age: "", email: "" }]);

  // Add-participant form state
  const [newParticipant, setNewParticipant] = useState({ name: "", age: "", email: "" });
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [addParticipantError, setAddParticipantError] = useState("");

  // Cancel / reactivate state
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [reactivatingSubscription, setReactivatingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");

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

  const { data: enrollmentData } = useQuery({
    queryKey: ["my-enrollment", courseId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}courses/${courseId}/my-enrollment`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) return { enrollment: null };
      return res.json();
    },
    enabled: loggedIn && !!courseId,
  });

  const myEnrollment = enrollmentData?.enrollment;

  const handleAddParticipant = async () => {
    setAddParticipantError("");
    if (!newParticipant.name.trim()) {
      setAddParticipantError("Name is required.");
      return;
    }
    try {
      setAddingParticipant(true);
      const res = await fetch(
        `${import.meta.env.VITE_DEV_URI}courses/enrollments/${myEnrollment._id}/add-participant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(newParticipant),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add participant");
      setNewParticipant({ name: "", age: "", email: "" });
      queryClient.invalidateQueries({ queryKey: ["my-enrollment", courseId] });
    } catch (err) {
      setAddParticipantError(err.message);
    } finally {
      setAddingParticipant(false);
    }
  };

  const handleCancelSubscription = async () => {
    setSubscriptionError("");
    setCancellingSubscription(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_DEV_URI}courses/enrollments/${myEnrollment._id}/cancel`,
        { method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel subscription");
      queryClient.invalidateQueries({ queryKey: ["my-enrollment", courseId] });
    } catch (err) {
      setSubscriptionError(err.message);
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setSubscriptionError("");
    setReactivatingSubscription(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_DEV_URI}courses/enrollments/${myEnrollment._id}/reactivate`,
        { method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reactivate subscription");
      if (data.url) {
        // Stripe subscription was gone — redirect to new checkout
        window.location.href = data.url;
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["my-enrollment", courseId] });
    } catch (err) {
      setSubscriptionError(err.message);
    } finally {
      setReactivatingSubscription(false);
    }
  };

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

      const res = await fetch(`${import.meta.env.VITE_DEV_URI}courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
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

  if (isLoading) return <p className="text-center text-base-content/50 mt-20">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-20">Error: {error.message}</p>;

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
        {canManage && (
          <div className="flex gap-3 mb-6">
            <Button variant="primary" to={`/courses/${courseSlug}/edit`}>
              Edit Course
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left — details */}
          <div className="md:col-span-2 space-y-6">
            {course.images && course.images.length > 0 && (
              <img
                src={course.images[0]}
                alt={course.title}
                className="w-full h-48 sm:h-64 object-cover rounded-2xl shadow-xl"
              />
            )}

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

          {/* Right — enrollment */}
          <div className="md:col-span-1">
            <GlassCard className="md:sticky md:top-20">
              <div className="p-6">
                {myEnrollment ? (
                  /* ── Already enrolled ── */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
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
                      <h2 className="text-xl font-bold text-base-content">You're Enrolled</h2>
                    </div>

                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                        myEnrollment.subscriptionStatus === "cancelled"
                          ? "bg-orange-100 text-orange-700"
                          : STATUS_STYLES[myEnrollment.status] || "bg-base-200 text-base-content"
                      }`}
                    >
                      {myEnrollment.subscriptionStatus === "cancelled"
                        ? "Cancelled"
                        : STATUS_LABELS[myEnrollment.status] || myEnrollment.status}
                    </span>

                    {myEnrollment.subscriptionId &&
                      myEnrollment.subscriptionStatus === "cancelled" && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
                          <p className="font-semibold mb-1">You have cancelled your subscription</p>
                          <p>You'll retain access until the end of your current billing period.</p>
                          {myEnrollment.currentPeriodEnd && (
                            <p className="mt-1 font-medium text-orange-600">
                              Access until{" "}
                              {new Date(myEnrollment.currentPeriodEnd).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      )}

                    {myEnrollment.subscriptionId &&
                      myEnrollment.subscriptionStatus !== "cancelled" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                          <p className="font-semibold mb-1">
                            {INTERVAL_ADJ[course.billingInterval] || "Monthly"} Subscription
                          </p>
                          <p>
                            £{course.price} / {INTERVAL_LABELS[course.billingInterval] || "month"}
                          </p>
                          {myEnrollment.currentPeriodEnd && (
                            <p className="mt-1 text-blue-600">
                              Renews{" "}
                              {new Date(myEnrollment.currentPeriodEnd).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      )}

                    {/* Current participants */}
                    <div>
                      <p className="text-sm font-semibold text-base-content mb-2">
                        Participants ({myEnrollment.participants?.length || 0})
                      </p>
                      <div className="space-y-1.5">
                        {myEnrollment.participants?.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-base-200/50 rounded-lg px-3 py-2 text-sm"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-base-content truncate">{p.name}</p>
                              {p.age && <p className="text-xs text-base-content/50">Age {p.age}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add participant form */}
                    {myEnrollment.status !== "cancelled" &&
                      myEnrollment.subscriptionStatus !== "cancelled" && (
                        <div className="border-t border-base-300/50 pt-4">
                          <p className="text-sm font-semibold text-base-content mb-2">
                            Add Participant
                          </p>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Name *"
                              value={newParticipant.name}
                              onChange={(e) =>
                                setNewParticipant((p) => ({ ...p, name: e.target.value }))
                              }
                              className="glass-input text-sm py-1.5"
                            />
                            <input
                              type="number"
                              placeholder="Age"
                              min="1"
                              value={newParticipant.age}
                              onChange={(e) =>
                                setNewParticipant((p) => ({ ...p, age: e.target.value }))
                              }
                              className="glass-input text-sm py-1.5"
                            />
                            {addParticipantError && (
                              <p className="text-red-500 text-xs">{addParticipantError}</p>
                            )}
                            <Button
                              variant="primary"
                              onClick={handleAddParticipant}
                              disabled={addingParticipant}
                              className="w-full text-sm"
                            >
                              {addingParticipant ? "Adding..." : "+ Add Participant"}
                            </Button>
                            {course.isSubscription && (
                              <p className="text-xs text-base-content/50 text-center">
                                Adding a participant will increase your subscription billing.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Cancel / Reactivate subscription */}
                    {myEnrollment.subscriptionId && (
                      <div className="border-t border-base-300/50 pt-4 space-y-2">
                        {myEnrollment.subscriptionStatus === "cancelled" ? (
                          <Button
                            variant="primary"
                            onClick={handleReactivateSubscription}
                            disabled={reactivatingSubscription}
                            className="w-full text-sm"
                          >
                            {reactivatingSubscription
                              ? "Reactivating..."
                              : "Reactivate Subscription"}
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            onClick={handleCancelSubscription}
                            disabled={cancellingSubscription}
                            className="w-full text-sm"
                          >
                            {cancellingSubscription ? "Cancelling..." : "Cancel Subscription"}
                          </Button>
                        )}
                        {subscriptionError && (
                          <p className="text-red-500 text-xs text-center">{subscriptionError}</p>
                        )}
                      </div>
                    )}

                    <Button variant="ghost" to="/profile" className="w-full text-sm">
                      Manage in Profile
                    </Button>
                  </div>
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

        <div className="mt-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    </PageContainer>
  );
}
