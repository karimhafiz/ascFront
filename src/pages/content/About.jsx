import React, { useEffect, useRef, useState } from "react";
import ConfirmModal from "../../components/common/ConfirmModal";
import { Button } from "../../components/ui";
import { fetchWithAuth, isAdmin, isModerator } from "../../auth/auth";
import { compressImage } from "../../util/compressImage";

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

const SECTION_LABELS = {
  hero: "the hero section",
  cards: "all activity cards",
  mission: "the mission section",
  getInvolved: "the Get Involved section",
};

function mergeWithDefaults(saved) {
  return {
    ...DEFAULTS,
    ...saved,
    activityCards: saved.activityCards?.length
      ? saved.activityCards.map((card, index) => ({
          ...DEFAULT_CARDS[index],
          ...card,
          image: card.image || DEFAULT_CARDS[index].image,
        }))
      : DEFAULTS.activityCards,
  };
}

function SectionIntro({ kicker, title, copy }) {
  return (
    <div className="mb-8 max-w-3xl">
      <span className="section-kicker mb-4">{kicker}</span>
      <h2 className="section-heading mb-3">{title}</h2>
      {copy && <p className="section-subcopy">{copy}</p>}
    </div>
  );
}

function ActivityCard({
  card,
  index,
  imgSrc,
  editing,
  onTitleChange,
  onDescriptionChange,
  onImagePick,
  imageRef,
}) {
  return (
    <article
      className={`glass-card overflow-hidden rounded-[1.75rem] ${
        editing ? "ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="relative aspect-[16/10] min-h-[220px] overflow-hidden">
        <img
          src={imgSrc}
          alt={card.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral/60 via-neutral/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="section-kicker border-white/15 bg-white/10 text-white shadow-none">
            Programme {index + 1}
          </span>
        </div>
        {editing && (
          <>
            <button
              onClick={onImagePick}
              className="absolute right-4 top-4 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary shadow-md hover:bg-white"
            >
              Change Image
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={imageRef}
              onChange={(e) => onImagePick(e.target.files[0])}
            />
          </>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {editing ? (
          <div className="space-y-4">
            <input
              className="glass-input text-base font-semibold text-primary"
              value={card.title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
            <textarea
              rows={4}
              className="glass-input resize-none text-sm"
              value={card.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
          </div>
        ) : (
          <>
            <h3 className="mb-3 text-2xl font-semibold tracking-[-0.03em] text-base-content">
              {card.title}
            </h3>
            <p className="text-sm leading-7 text-base-content/72 sm:text-base">
              {card.description}
            </p>
          </>
        )}
      </div>
    </article>
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
  const [resetting, setResetting] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [pendingReset, setPendingReset] = useState(null);
  const cardImageRefs = useRef([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_DEV_URI}pageContent/about`)
      .then((response) => response.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          const merged = mergeWithDefaults(data);
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

  const resetSection = (section) => setPendingReset(section);

  const doReset = async () => {
    const section = pendingReset;
    setPendingReset(null);
    setResetting(true);
    setSaveError(null);

    try {
      const url =
        section === "all"
          ? `${import.meta.env.VITE_DEV_URI}pageContent/about`
          : `${import.meta.env.VITE_DEV_URI}pageContent/about/${section}`;

      const res = await fetchWithAuth(url, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Server error (${res.status})`);
      }

      const data = await res.json();
      if (section === "all") {
        setPageContent(DEFAULTS);
        setDraft(DEFAULTS);
        setEditing(false);
      } else {
        const merged = mergeWithDefaults(data.pageContent || {});
        setPageContent(merged);
        setDraft(JSON.parse(JSON.stringify(merged)));
        if (section === "cards") {
          setCardImageFiles({});
          setCardImagePreviews({});
        }
      }
    } catch (err) {
      setSaveError(err.message || "Failed to reset. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  const updateCard = (index, field, value) => {
    const cards = draft.activityCards.map((card, cardIndex) =>
      cardIndex === index ? { ...card, [field]: value } : card
    );
    setDraft({ ...draft, activityCards: cards });
  };

  const handleCardImageChange = async (index, file) => {
    if (!file) return;
    const compressed = await compressImage(file);
    setCardImageFiles((prev) => ({ ...prev, [index]: compressed }));
    setCardImagePreviews((prev) => ({ ...prev, [index]: URL.createObjectURL(compressed) }));
  };

  const handleSave = async () => {
    setSaveError(null);

    const errors = [];
    if (!draft.aboutHeroTitle?.trim()) errors.push("Hero title cannot be empty.");
    if (!draft.aboutHeroDescription?.trim()) errors.push("Hero description cannot be empty.");
    if (!draft.missionTitle?.trim()) errors.push("Mission title cannot be empty.");
    if (!draft.missionText?.trim()) errors.push("Mission text cannot be empty.");
    if (!draft.getInvolvedTitle?.trim()) errors.push("Get Involved title cannot be empty.");
    if (!draft.getInvolvedText?.trim()) errors.push("Get Involved text cannot be empty.");
    draft.activityCards.forEach((card, index) => {
      if (!card.title?.trim()) errors.push(`Activity card ${index + 1} title cannot be empty.`);
      if (!card.description?.trim()) {
        errors.push(`Activity card ${index + 1} description cannot be empty.`);
      }
    });
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

      const res = await fetchWithAuth(`${import.meta.env.VITE_DEV_URI}pageContent/about`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Server error (${res.status})`);
      }

      const { pageContent: saved } = await res.json();
      setPageContent(mergeWithDefaults(saved));
      setEditing(false);
      setCardImageFiles({});
      setCardImagePreviews({});
    } catch (err) {
      setSaveError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetLabel =
    pendingReset === "all" ? "the entire about page" : SECTION_LABELS[pendingReset];

  const cards = editing ? draft.activityCards : pageContent.activityCards;

  return (
    <div className="pb-12">
      <ConfirmModal
        isOpen={!!pendingReset}
        title="Reset to Defaults?"
        message={`Reset ${resetLabel} to default content? This will permanently clear any custom text and images for that section.`}
        confirmLabel="Reset"
        onConfirm={doReset}
        onCancel={() => setPendingReset(null)}
      />

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
                onClick={() => resetSection("all")}
                disabled={resetting}
                className="btn border border-warning/25 bg-warning/10 text-warning-content hover:bg-warning/15"
              >
                {resetting ? "Resetting..." : "Reset All to Defaults"}
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

      <section className="page-section pt-4 md:pt-6">
        <div
          className={`hero-panel rounded-[2rem] px-6 py-8 md:px-10 md:py-10 ${
            editing ? "ring-2 ring-secondary/35" : ""
          }`}
        >
          <div className="mx-auto max-w-4xl text-center">
            <span className="section-kicker mb-5 border-white/10 bg-white/8 text-white">
              About Us
            </span>
            {editing ? (
              <div className="space-y-4">
                <input
                  className="glass-input text-center text-3xl font-bold text-primary"
                  value={draft.aboutHeroTitle}
                  onChange={(e) => setDraft({ ...draft, aboutHeroTitle: e.target.value })}
                />
                <textarea
                  rows={4}
                  className="glass-input text-center text-base resize-none"
                  value={draft.aboutHeroDescription}
                  onChange={(e) => setDraft({ ...draft, aboutHeroDescription: e.target.value })}
                />
                <Button
                  variant="secondary"
                  onClick={() => resetSection("hero")}
                  disabled={resetting}
                >
                  Reset Hero
                </Button>
              </div>
            ) : (
              <>
                <h1 className="mb-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">
                  {pageContent.aboutHeroTitle}
                </h1>
                <p className="mx-auto max-w-3xl text-base leading-8 text-neutral-content/82 md:text-lg">
                  {pageContent.aboutHeroDescription}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="page-section py-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div
            className={`glass-card rounded-[2rem] p-7 sm:p-8 ${editing ? "ring-2 ring-primary/20" : ""}`}
          >
            <span className="section-kicker mb-4">Our Mission</span>
            {editing ? (
              <div className="space-y-4">
                <input
                  className="glass-input text-2xl font-bold text-primary"
                  value={draft.missionTitle}
                  onChange={(e) => setDraft({ ...draft, missionTitle: e.target.value })}
                />
                <textarea
                  rows={6}
                  className="glass-input resize-none"
                  value={draft.missionText}
                  onChange={(e) => setDraft({ ...draft, missionText: e.target.value })}
                />
                <Button
                  variant="secondary"
                  onClick={() => resetSection("mission")}
                  disabled={resetting}
                >
                  Reset Mission
                </Button>
              </div>
            ) : (
              <>
                <h2 className="mb-5 text-3xl font-semibold tracking-[-0.03em] text-base-content">
                  {pageContent.missionTitle}
                </h2>
                <p className="text-base leading-7 text-base-content/76 sm:text-lg sm:leading-8">
                  {pageContent.missionText}
                </p>
              </>
            )}
          </div>

          <div
            className={`hero-panel rounded-[2rem] p-7 sm:p-8 ${editing ? "ring-2 ring-secondary/30" : ""}`}
          >
            <span className="section-kicker mb-4 border-white/10 bg-white/8 text-white">
              Get Involved
            </span>
            {editing ? (
              <div className="space-y-4">
                <input
                  className="glass-input text-2xl font-bold text-primary"
                  value={draft.getInvolvedTitle}
                  onChange={(e) => setDraft({ ...draft, getInvolvedTitle: e.target.value })}
                />
                <textarea
                  rows={5}
                  className="glass-input resize-none"
                  value={draft.getInvolvedText}
                  onChange={(e) => setDraft({ ...draft, getInvolvedText: e.target.value })}
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => resetSection("getInvolved")}
                    disabled={resetting}
                  >
                    Reset Section
                  </Button>
                  <Button variant="primary" disabled>
                    Contact Us
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="mb-5 text-3xl font-semibold tracking-[-0.03em] text-white">
                  {pageContent.getInvolvedTitle}
                </h2>
                <p className="mb-6 text-base leading-7 text-neutral-content/82 sm:text-base sm:leading-8">
                  {pageContent.getInvolvedText}
                </p>
                <Button variant="secondary" to="/contact">
                  Contact Us
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="page-section py-8 md:py-10">
        <SectionIntro
          kicker="What We Do"
          title="Community programmes at a glance"
          copy="After understanding our purpose, this section gives a quick picture of the programmes and spaces we create for the community."
        />

        {editing && (
          <div className="mb-6 flex justify-end">
            <Button variant="secondary" onClick={() => resetSection("cards")} disabled={resetting}>
              Reset Programme Cards
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {cards.map((card, index) => {
            const imgSrc = cardImagePreviews[index] || card.image;

            return (
              <ActivityCard
                key={index}
                card={card}
                index={index}
                imgSrc={imgSrc}
                editing={editing}
                onTitleChange={(value) => updateCard(index, "title", value)}
                onDescriptionChange={(value) => updateCard(index, "description", value)}
                onImagePick={(file) => {
                  if (file instanceof File) {
                    handleCardImageChange(index, file);
                  } else {
                    cardImageRefs.current[index]?.click();
                  }
                }}
                imageRef={(element) => {
                  cardImageRefs.current[index] = element;
                }}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
