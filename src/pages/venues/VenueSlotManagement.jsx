import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageContainer, Spinner } from "../../components/ui";
import { slugToId } from "../../util/util";
import ScheduleEditor from "./venueSlots/ScheduleEditor";
import SlotList from "./venueSlots/SlotList";
import { queryKeys } from "../../api/queryKeys";
import { fetchOrThrow } from "../../util/errorUtil";
import {
  useVenueScheduleMutation,
  useVenueGenerateSlotsMutation,
} from "../../hooks/useVenueMutation";

const API = import.meta.env.VITE_DEV_URI;

export default function VenueSlotManagement() {
  const { venueSlug } = useParams();
  const venueId = slugToId(venueSlug);
  const scheduleSeeded = useRef(false);
  const scheduleMutation = useVenueScheduleMutation(venueId);
  const generateMutation = useVenueGenerateSlotsMutation(venueId);

  const [schedule, setSchedule] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: queryKeys.venues.detail(venueId),
    queryFn: async () => {
      const res = await fetchOrThrow(`${API}venues/${venueId}`);
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
      await scheduleMutation.mutateAsync(updatedSchedule);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleGenerate = async (from, to) => {
    const data = await generateMutation.mutateAsync({ fromDate: from, toDate: to });
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
