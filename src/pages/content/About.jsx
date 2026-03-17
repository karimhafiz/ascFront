import React, { useState, useEffect, useRef } from "react";
import { isAdmin, isModerator, getAuthToken } from "../../auth/auth";

const DEFAULT_CARDS = [
  {
    title: "Community Events",
    description:
      "We organize events that bring people together, celebrate diversity, and promote cultural understanding.",
    image: "/images/community-events.jpg",
  },
  {
    title: "Workshops",
    description:
      "Our workshops focus on skill-building, education, and personal development to empower individuals in the community.",
    image: "/images/workshops.jpg",
  },
  {
    title: "Social Gatherings",
    description:
      "We host social gatherings to create opportunities for networking, friendship, and collaboration.",
    image: "/images/social-gatherings.jpg",
  },
  {
    title: "Youth Programs",
    description:
      "Our youth programs are designed to inspire and support the next generation of leaders in our community.",
    image: "/images/youth-programs.jpg",
  },
];

const DEFAULTS = {
  aboutHeroTitle: "About Ayendah Sazan",
  aboutHeroDescription:
    "Ayendah Sazan is dedicated to strengthening the community by hosting engaging events, workshops, and social gatherings. We aim to empower individuals and foster a sense of belonging.",
  activityCards: DEFAULT_CARDS,
  missionTitle: "Our Mission",
  missionText:
    "At Ayendah Sazan, our mission is to create a vibrant and inclusive community where everyone feels valued and supported. We strive to empower individuals through education, cultural exchange, and meaningful connections.",
  getInvolvedTitle: "Get Involved",
  getInvolvedText:
    "Join us in making a difference! Whether you want to volunteer, attend an event, or support our initiatives, there are many ways to get involved with Ayendah Sazan.",
};

function EditableField({ editing, value, onChange, className, multiline, placeholder, rows = 3 }) {
  if (!editing)
    return multiline ? (
      <p className={className}>{value}</p>
    ) : (
      <span className={className}>{value}</span>
    );

  if (multiline)
    return (
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-input text-sm resize-none"
      />
    );

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="glass-input text-sm"
    />
  );
}

export default function About() {
  const canEdit = isAdmin() || isModerator();

  const [pageContent, setPageContent] = useState(DEFAULTS);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULTS);
  const [cardImageFiles, setCardImageFiles] = useState({});
  const [cardImagePreviews, setCardImagePreviews] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const cardImageRefs = useRef([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_DEV_URI}pageContent/about`)
      .then((r) => r.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          const merged = {
            ...DEFAULTS,
            ...data,
            activityCards: data.activityCards?.length
              ? data.activityCards.map((c, i) => ({ ...DEFAULT_CARDS[i], ...c }))
              : DEFAULTS.activityCards,
          };
          setPageContent(merged);
          setDraft(merged);
        }
      })
      .catch(() => {});
  }, []);

  const handleEdit = () => {
    setDraft(JSON.parse(JSON.stringify(pageContent)));
    setCardImageFiles({});
    setCardImagePreviews({});
    setSaveError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setCardImageFiles({});
    setCardImagePreviews({});
    setSaveError(null);
  };

  const updateCard = (index, field, value) => {
    const cards = draft.activityCards.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    setDraft({ ...draft, activityCards: cards });
  };

  const handleCardImageChange = (index, file) => {
    if (!file) return;
    setCardImageFiles((prev) => ({ ...prev, [index]: file }));
    setCardImagePreviews((prev) => ({ ...prev, [index]: URL.createObjectURL(file) }));
  };

  const handleSave = async () => {
    setSaveError(null);

    // ── Client-side validation ──
    const errors = [];
    if (!draft.aboutHeroTitle?.trim()) errors.push("Hero title cannot be empty.");
    if (!draft.aboutHeroDescription?.trim()) errors.push("Hero description cannot be empty.");
    if (!draft.missionTitle?.trim()) errors.push("Mission title cannot be empty.");
    if (!draft.missionText?.trim()) errors.push("Mission text cannot be empty.");
    if (!draft.getInvolvedTitle?.trim()) errors.push("Get Involved title cannot be empty.");
    if (!draft.getInvolvedText?.trim()) errors.push("Get Involved text cannot be empty.");
    draft.activityCards.forEach((card, i) => {
      if (!card.title?.trim()) errors.push(`Activity card ${i + 1} title cannot be empty.`);
      if (!card.description?.trim())
        errors.push(`Activity card ${i + 1} description cannot be empty.`);
    });
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
          aboutHeroTitle: draft.aboutHeroTitle,
          aboutHeroDescription: draft.aboutHeroDescription,
          activityCards: draft.activityCards,
          missionTitle: draft.missionTitle,
          missionText: draft.missionText,
          getInvolvedTitle: draft.getInvolvedTitle,
          getInvolvedText: draft.getInvolvedText,
        })
      );
      Object.entries(cardImageFiles).forEach(([index, file]) => {
        formData.append(`activityImage_${index}`, file);
      });

      const res = await fetch(`${import.meta.env.VITE_DEV_URI}pageContent/about`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Server error (${res.status})`);
      }
      const { pageContent: saved } = await res.json();
      const merged = {
        ...DEFAULTS,
        ...saved,
        activityCards: saved.activityCards?.length
          ? saved.activityCards.map((c, i) => ({ ...DEFAULT_CARDS[i], ...c }))
          : DEFAULTS.activityCards,
      };
      setPageContent(merged);
      setEditing(false);
      setCardImageFiles({});
      setCardImagePreviews({});
    } catch (err) {
      setSaveError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* ── Edit toolbar ── */}
      {canEdit && (
        <div className="fixed top-24 right-6 z-50 flex gap-2">
          {!editing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-pink-200 hover:scale-105 transition-all"
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
                className="px-4 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium shadow hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-pink-200 hover:scale-105 transition-all disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          )}
        </div>
      )}

      {saveError && (
        <div className="fixed top-36 right-6 z-50 max-w-sm bg-red-50/95 backdrop-blur-sm border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl shadow-lg animate-scale-in">
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
      <div
        className={`text-center mb-12 ${editing ? "bg-white/40 rounded-2xl p-6 ring-2 ring-purple-200" : ""}`}
      >
        {editing ? (
          <>
            <input
              className="glass-input text-center text-3xl font-bold text-purple-700 mb-3"
              value={draft.aboutHeroTitle}
              onChange={(e) => setDraft({ ...draft, aboutHeroTitle: e.target.value })}
            />
            <textarea
              rows={3}
              className="glass-input text-center text-lg resize-none"
              value={draft.aboutHeroDescription}
              onChange={(e) => setDraft({ ...draft, aboutHeroDescription: e.target.value })}
            />
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-primary mb-4">{pageContent.aboutHeroTitle}</h1>
            <p className="text-lg text-gray-700">{pageContent.aboutHeroDescription}</p>
          </>
        )}
      </div>

      {/* ── What We Do ── */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-secondary mb-6 text-center">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(editing ? draft.activityCards : pageContent.activityCards).map((card, i) => {
            const imgSrc = cardImagePreviews[i] || card.image;
            return (
              <div
                key={i}
                className={`glass-card overflow-hidden transition-all ${editing ? "ring-2 ring-purple-200" : ""}`}
              >
                <div className="relative w-full h-64">
                  <img
                    src={imgSrc}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {editing && (
                    <>
                      <button
                        onClick={() => cardImageRefs.current[i]?.click()}
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
                        Change
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => (cardImageRefs.current[i] = el)}
                        onChange={(e) => handleCardImageChange(i, e.target.files[0])}
                      />
                    </>
                  )}
                </div>
                <div className="p-6 text-center space-y-2">
                  {editing ? (
                    <>
                      <input
                        className="glass-input text-center font-semibold text-purple-700 py-1.5"
                        value={card.title}
                        onChange={(e) => updateCard(i, "title", e.target.value)}
                      />
                      <textarea
                        rows={3}
                        className="glass-input text-center text-sm resize-none py-1.5"
                        value={card.description}
                        onChange={(e) => updateCard(i, "description", e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-primary mb-2">{card.title}</h3>
                      <p className="text-gray-600">{card.description}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mission ── */}
      <div
        className={`mb-12 text-center glass-card max-w-3xl mx-auto p-8 transition-all ${editing ? "ring-2 ring-purple-200" : ""}`}
      >
        {editing ? (
          <>
            <input
              className="glass-input text-center text-2xl font-bold text-purple-700 mb-4"
              value={draft.missionTitle}
              onChange={(e) => setDraft({ ...draft, missionTitle: e.target.value })}
            />
            <textarea
              rows={4}
              className="glass-input text-center resize-none"
              value={draft.missionText}
              onChange={(e) => setDraft({ ...draft, missionText: e.target.value })}
            />
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-secondary mb-6">{pageContent.missionTitle}</h2>
            <p className="text-lg text-gray-700 mx-auto max-w-3xl">{pageContent.missionText}</p>
          </>
        )}
      </div>

      {/* ── Get Involved ── */}
      <div
        className={`text-center glass-card max-w-2xl mx-auto p-8 transition-all ${editing ? "ring-2 ring-purple-200" : ""}`}
      >
        {editing ? (
          <>
            <input
              className="glass-input text-center text-2xl font-bold text-purple-700 mb-4"
              value={draft.getInvolvedTitle}
              onChange={(e) => setDraft({ ...draft, getInvolvedTitle: e.target.value })}
            />
            <textarea
              rows={3}
              className="glass-input text-center resize-none mb-4"
              value={draft.getInvolvedText}
              onChange={(e) => setDraft({ ...draft, getInvolvedText: e.target.value })}
            />
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-secondary mb-6">
              {pageContent.getInvolvedTitle}
            </h2>
            <p className="text-lg text-gray-700 mb-6">{pageContent.getInvolvedText}</p>
          </>
        )}
        <a
          href="/contact"
          className="inline-block btn btn-primary px-6 py-3 text-white rounded-xl shadow-md hover:scale-105 hover:bg-pink-400 transition-all"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
