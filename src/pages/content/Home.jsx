import React, { useState, useEffect, useRef } from "react";
import { Link, useRouteLoaderData } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import EventCard from "../../components/events/EventCard";
import { isAdmin, isModerator, getAuthToken } from "../../auth/auth";

const DEFAULTS = {
  heroTitle: "Welcome to Ayendah Sazan",
  heroDescription:
    "We are a community-based organization in Leeds, dedicated to bringing people together through cultural and educational events. Join us to celebrate diversity and foster connections.",
  heroBadgeText: "Inspiring Communities",
  heroImage: "/heroImage.jpg",
};

export default function Home() {
  const { events } = useRouteLoaderData("root");
  const canEdit = isAdmin() || isModerator();

  const [pageContent, setPageContent] = useState(DEFAULTS);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULTS);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const heroImageInputRef = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_DEV_URI}pageContent/home`)
      .then((r) => r.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          const merged = { ...DEFAULTS, ...data };
          setPageContent(merged);
          setDraft(merged);
        }
      })
      .catch(() => {});
  }, []);

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

  const handleSave = async () => {
    setSaveError(null);

    // ── Client-side validation ──
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
      const token = getAuthToken();
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

      const res = await fetch(`${import.meta.env.VITE_DEV_URI}pageContent/home`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Server error (${res.status})`);
      }
      const { pageContent: saved } = await res.json();
      const merged = { ...DEFAULTS, ...saved };
      setPageContent(merged);
      setEditing(false);
      setHeroImagePreview(null);
      setHeroImageFile(null);
    } catch (err) {
      setSaveError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date());
  const heroImage = heroImagePreview || pageContent.heroImage;

  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen">
      <Helmet>
        <title>Ayendah Sazan - Home</title>
        <meta name="description" content={pageContent.heroDescription} />
      </Helmet>

      {/* ── Edit toolbar ── */}
      {canEdit && (
        <div className="sticky top-16 z-40 flex justify-end gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border-b border-white/40">
          {!editing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-pink-200 hover:scale-105 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Page
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium shadow hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-pink-200 hover:scale-105 transition-all disabled:opacity-60 cursor-pointer"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          )}
        </div>
      )}

      {saveError && (
        <div className="fixed top-28 sm:top-36 right-3 sm:right-6 z-50 max-w-[calc(100vw-1.5rem)] sm:max-w-sm bg-red-50/95 backdrop-blur-sm border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl shadow-lg animate-scale-in">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
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
              <p className="font-medium mb-0.5">Could not save</p>
              <p className="text-xs leading-relaxed">{saveError}</p>
            </div>
            <button
              onClick={() => setSaveError(null)}
              className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* ── Hero ── */}
      <div className="hero bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 py-16">
        <div className="hero-content flex flex-col-reverse lg:flex-row items-center gap-6 sm:gap-12 px-4">
          {/* Text card */}
          <div
            className={`text-center lg:text-left md:max-w-lg glass-card p-5 sm:p-8 rounded-2xl backdrop-blur-md border shadow-xl transition-all duration-500 ${editing ? "border-purple-300 ring-2 ring-purple-200" : "border-white/30 hover:shadow-2xl"}`}
          >
            {editing ? (
              <>
                <input
                  className="glass-input text-3xl font-bold text-purple-700 mb-3"
                  value={draft.heroTitle}
                  onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })}
                  placeholder="Hero title"
                />
                <textarea
                  rows={4}
                  className="glass-input text-base mb-4 resize-none"
                  value={draft.heroDescription}
                  onChange={(e) => setDraft({ ...draft, heroDescription: e.target.value })}
                  placeholder="Hero description"
                />
              </>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-purple-700 mb-4">
                  {pageContent.heroTitle}
                </h1>
                <p className="text-sm md:text-base xl:text-lg text-indigo-700 mb-6">
                  {pageContent.heroDescription}
                </p>
              </>
            )}
            <Link
              to="/about"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 text-base rounded-xl shadow-md hover:scale-105 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>

          {/* Image */}
          <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg transform hover:rotate-1 transition-all duration-500">
            <img
              src={heroImage}
              alt="Community Event"
              className={`rounded-2xl shadow-xl object-cover w-full h-auto ring-4 ${editing ? "ring-purple-300" : "ring-white/50"}`}
            />
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm">
              {editing ? (
                <input
                  className="bg-transparent border-b border-white/60 text-white text-sm focus:outline-none w-28 sm:w-36"
                  value={draft.heroBadgeText}
                  onChange={(e) => setDraft({ ...draft, heroBadgeText: e.target.value })}
                  placeholder="Badge text"
                />
              ) : (
                pageContent.heroBadgeText
              )}
            </div>
            {editing && (
              <>
                <button
                  onClick={() => heroImageInputRef.current?.click()}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 rounded-full text-xs font-medium text-purple-700 shadow hover:bg-white transition-all"
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Change Image
                </button>
                <input
                  ref={heroImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setHeroImageFile(file);
                    setHeroImagePreview(URL.createObjectURL(file));
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Upcoming Events ── */}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-700">Upcoming Events</h1>
        {upcomingEvents?.length === 0 ? (
          <div className="glass-card p-8 text-center rounded-xl backdrop-blur-md shadow-xl">
            <p className="text-purple-600">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents?.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
