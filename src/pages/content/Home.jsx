import React, { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "../../components/common/ConfirmModal";
import CourseCard from "../../components/courses/CourseCard";
import EventCard from "../../components/events/EventCard";
import Button from "../../components/ui/Button";
import { fetchWithAuth, isAdmin, isModerator } from "../../auth/auth";
import { compressImage } from "../../util/compressImage";
import { useEvents } from "../../hooks/useEvents";
import { useCourses } from "../../hooks/useCourses";
import { API } from "../../api/apiClient";
import { queryKeys } from "../../api/queryKeys";

const DEFAULTS = {
  heroTitle: "Welcome to Ayendah Sazan",
  heroDescription:
    "We are a community-based organization in Leeds, dedicated to bringing people together through cultural and educational events. Join us to celebrate diversity and foster connections.",
  heroBadgeText: "Inspiring Communities",
  heroImage: "/heroImage.jpg",
};

function mergeWithDefaults(saved) {
  return { ...DEFAULTS, ...saved, heroImage: saved.heroImage || DEFAULTS.heroImage };
}

function SectionHeader({ kicker, title, action }) {
  return (
    <div className="mb-8 flex flex-col items-center text-center gap-4 md:flex-row md:items-end md:justify-between md:text-left">
      <div className="max-w-2xl">
        <span className="section-kicker mb-4">{kicker}</span>
        <h2 className="section-heading">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function Home() {
  const { data: events } = useEvents();
  const { data: courses } = useCourses();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULTS);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const heroImageInputRef = useRef(null);

  const canEdit = isAdmin() || isModerator();

  const { data: rawPageContent } = useQuery({
    queryKey: queryKeys.pageContent.home,
    queryFn: async () => {
      const r = await fetch(`${API}pageContent/home`);
      return r.json();
    },
  });

  const pageContent =
    rawPageContent && Object.keys(rawPageContent).length > 0
      ? mergeWithDefaults(rawPageContent)
      : DEFAULTS;

  const handleEdit = () => {
    setDraft({ ...pageContent });
    setHeroImagePreview(null);
    setHeroImageFile(null);
    setSaveError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setHeroImagePreview(null);
    setHeroImageFile(null);
    setSaveError(null);
  };

  const doReset = async () => {
    setConfirmOpen(false);
    setResetting(true);
    setSaveError(null);
    try {
      const res = await fetchWithAuth(`${API}pageContent/home`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Server error (${res.status})`);
      }
      queryClient.setQueryData(queryKeys.pageContent.home, {});
      setHeroImagePreview(null);
      setHeroImageFile(null);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message || "Failed to reset. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  const handleSave = async () => {
    setSaveError(null);

    const errors = [];
    if (!draft.heroTitle?.trim()) errors.push("Hero title cannot be empty.");
    if (!draft.heroDescription?.trim()) errors.push("Hero description cannot be empty.");
    if (!draft.heroBadgeText?.trim()) errors.push("Badge text cannot be empty.");
    if (errors.length > 0) {
      setSaveError(errors.join(" "));
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        "contentData",
        JSON.stringify({
          heroTitle: draft.heroTitle,
          heroDescription: draft.heroDescription,
          heroBadgeText: draft.heroBadgeText,
        })
      );
      if (heroImageFile) formData.append("heroImage", heroImageFile);

      const res = await fetchWithAuth(`${API}pageContent/home`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Server error (${res.status})`);
      }

      const { pageContent: saved } = await res.json();
      queryClient.setQueryData(queryKeys.pageContent.home, saved);
      setEditing(false);
      setHeroImagePreview(null);
      setHeroImageFile(null);
    } catch (err) {
      setSaveError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const upcomingEvents = (events || [])
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const availableCourses = (courses || []).filter((course) => course.enrollmentOpen).slice(0, 3);
  const heroImage = heroImagePreview || pageContent.heroImage;

  return (
    <div className="pb-10">
      <ConfirmModal
        isOpen={confirmOpen}
        title="Reset to Defaults?"
        message="This will permanently clear all custom text and images on the home page."
        confirmLabel="Reset"
        onConfirm={doReset}
        onCancel={() => setConfirmOpen(false)}
      />

      <Helmet>
        <title>Ayendah Sazan - Home</title>
        <meta name="description" content={pageContent.heroDescription} />
      </Helmet>

      {canEdit && (
        <div className="sticky top-20 z-40 mx-auto mb-6 mt-6 flex w-[min(1200px,calc(100%-2rem))] flex-wrap justify-end gap-2 rounded-3xl border border-white/60 bg-white/75 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-xl">
          {!editing ? (
            <Button variant="primary" onClick={handleEdit}>
              Edit Page
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={resetting}
                className="btn border border-warning/25 bg-warning/10 text-warning-content hover:bg-warning/15"
              >
                {resetting ? "Resetting..." : "Reset to Defaults"}
              </button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      )}

      {saveError && (
        <div className="fixed right-3 top-28 z-50 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-600 shadow-lg backdrop-blur-sm animate-scale-in sm:right-6 sm:top-36 sm:max-w-sm">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="mb-0.5 font-medium">Could not save</p>
              <p className="text-xs leading-relaxed">{saveError}</p>
            </div>
            <button
              onClick={() => setSaveError(null)}
              className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <section className="page-section py-6 md:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            className={`hero-panel rounded-[2rem] p-6 sm:p-8 lg:p-10 ${
              editing ? "ring-2 ring-secondary/35" : ""
            }`}
          >
            <span className="section-kicker mb-5 border-white/10 bg-white/8 text-white">
              {editing ? "Editing Home Page" : pageContent.heroBadgeText}
            </span>
            {editing ? (
              <>
                <input
                  className="glass-input mb-4 text-3xl font-bold text-primary"
                  value={draft.heroTitle}
                  onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })}
                  placeholder="Hero title"
                />
                <textarea
                  rows={5}
                  className="glass-input mb-4 resize-none text-base"
                  value={draft.heroDescription}
                  onChange={(e) => setDraft({ ...draft, heroDescription: e.target.value })}
                  placeholder="Hero description"
                />
                <input
                  className="glass-input max-w-xs text-sm"
                  value={draft.heroBadgeText}
                  onChange={(e) => setDraft({ ...draft, heroBadgeText: e.target.value })}
                  placeholder="Badge text"
                />
              </>
            ) : (
              <>
                <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-5xl xl:text-6xl">
                  {pageContent.heroTitle}
                </h1>
                <p className="section-subcopy mb-8 max-w-2xl text-base md:text-lg">
                  {pageContent.heroDescription}
                </p>
              </>
            )}
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" to="/about" className="border border-white/10">
                Learn More
              </Button>
              <Button variant="secondary" to="/events">
                Explore Events
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-secondary/12 blur-2xl" />
            <div className="absolute -bottom-6 -right-3 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />
            <div
              className={`glass-card relative overflow-hidden rounded-[2rem] p-3 ${
                editing ? "ring-2 ring-primary/20" : ""
              }`}
            >
              <img
                src={heroImage}
                alt="Community event"
                className="aspect-[4/4.2] w-full rounded-[1.5rem] object-cover sm:aspect-[4/3.8]"
                fetchpriority="high"
                width="500"
                height="375"
              />
              <div className="absolute bottom-7 left-7 rounded-2xl border border-white/15 bg-neutral/80 px-4 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-xl">
                {editing ? draft.heroBadgeText || "Badge text" : pageContent.heroBadgeText}
              </div>
              {editing && (
                <>
                  <button
                    onClick={() => heroImageInputRef.current?.click()}
                    className="absolute right-6 top-6 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary shadow-md hover:bg-white"
                  >
                    Change Image
                  </button>
                  <input
                    ref={heroImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const compressed = await compressImage(file);
                      setHeroImageFile(compressed);
                      setHeroImagePreview(URL.createObjectURL(compressed));
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section py-4 md:py-8">
        <div className="grid gap-4 rounded-[2rem] bg-neutral px-6 py-8 text-white shadow-[var(--shadow-strong)] sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "500+", label: "Community members engaged" },
            { value: "50+", label: "Events delivered" },
            { value: "20+", label: "Courses offered" },
            { value: "Leeds", label: "Serving the local community" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/8 bg-white/5 p-4 text-center"
            >
              <div className="mb-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                {value}
              </div>
              <div className="text-sm text-neutral-content/70">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section py-8 md:py-12">
        <SectionHeader
          kicker="Community Calendar"
          title="Upcoming Events"
          action={
            <Link
              to="/events/asc"
              className="self-center md:self-auto inline-flex items-center gap-2 rounded-full border border-base-300 bg-white/80 px-5 py-3 text-sm font-semibold text-base-content shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
            >
              View All Events
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          }
        />
        {upcomingEvents.length === 0 ? (
          <div className="glass-card rounded-[1.75rem] p-8 text-center">
            <p className="text-base-content/70">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="page-section py-8 md:py-12">
        <SectionHeader
          kicker="Learning Opportunities"
          title="Available Courses"
          action={
            <Link
              to="/courses"
              className="self-center md:self-auto inline-flex items-center gap-2 rounded-full border border-base-300 bg-white/80 px-5 py-3 text-sm font-semibold text-base-content shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
            >
              View All Courses
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          }
        />
        {availableCourses.length === 0 ? (
          <div className="glass-card rounded-[1.75rem] p-8 text-center">
            <p className="text-base-content/70">No courses available right now.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
