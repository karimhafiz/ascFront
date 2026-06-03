import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageContainer, Spinner } from "../../components/ui";
import { fetchWithAuth } from "../../auth/auth";
import { slugToId } from "../../util/util";
import ScheduleEditor from "./venueSlots/ScheduleEditor";
import SlotList from "./venueSlots/SlotList";

const API = import.meta.env.VITE_DEV_URI;

export default function VenueSlotManagement() {
  const { venueSlug } = useParams();
  const venueId = slugToId(venueSlug);
  const queryClient = useQueryClient();
  const scheduleSeeded = useRef(false);

  const [schedule, setSchedule] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: async () => {
      const res = await fetch(`${API}venues/${venueId}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to load venue.");
      return data;
    },
  });

  // Seed working copy once — guarded so refetches don't clobber unsaved edits
  useEffect(() => {
    if (venue?.weeklySchedule && !scheduleSeeded.current) {
      setSchedule(venue.weeklySchedule);
      scheduleSeeded.current = true;
    }
  }, [venue]);

  const handleSaveSchedule = async (updatedSchedule) => {
    setSavingSchedule(true);
    try {
      const res = await fetchWithAuth(`${API}venues/${venueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklySchedule: updatedSchedule }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to save schedule.");
      queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleGenerate = async (from, to) => {
    const res = await fetchWithAuth(`${API}venues/${venueId}/slots/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromDate: from, toDate: to }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Failed to generate slots.");
    queryClient.invalidateQueries({ queryKey: ["venue-slots-all", venueId], exact: false });
    return data.message;
  };

  if (venueLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <PageContainer className="pb-12">
      <Helmet>
        <title>Slot Management{venue ? ` — ${venue.name}` : ""} | Ayendah Sazan</title>
      </Helmet>

      <section className="page-section pt-6 md:pt-8">
        <Link
          to="/venues/booking"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 hover:text-base-content"
        >
          ← All Venues
        </Link>

        <div className="mb-8">
          <span className="section-kicker mb-3">Slot Management</span>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-base-content">
            {venue?.name || "Venue"} — Slots
          </h1>
        </div>

        <ScheduleEditor
          schedule={schedule}
          setSchedule={setSchedule}
          onSave={handleSaveSchedule}
          saving={savingSchedule}
          onGenerate={handleGenerate}
        />

        <SlotList venueId={venueId} />
      </section>
    </PageContainer>
  );
}
