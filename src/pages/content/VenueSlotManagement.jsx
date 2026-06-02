import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, GlassCard, PageContainer, Spinner } from "../../components/ui";
import { fetchWithAuth } from "../../auth/auth";
import { slugToId, formatDate } from "../../util/util";

const API = import.meta.env.VITE_DEV_URI;

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const WEEKENDS = ["saturday", "sunday"];

const TIME_OPTIONS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

const today = formatDate(new Date());

export default function VenueSlotManagement() {
  const { venueSlug } = useParams();
  const venueId = slugToId(venueSlug);
  const queryClient = useQueryClient();

  // ── Weekly schedule editor state ──
  const [schedule, setSchedule] = useState([]); // working copy of venue.weeklySchedule
  const [scheduleError, setScheduleError] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);

  // New entry form
  const [newDays, setNewDays] = useState([]);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  // ── Generate slots state ──
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generateSuccess, setGenerateSuccess] = useState("");

  // ── Extra slot state ──
  const [oneOffDate, setOneOffDate] = useState("");
  const [oneOffStart, setOneOffStart] = useState("");
  const [oneOffEnd, setOneOffEnd] = useState("");
  const [oneOffError, setOneOffError] = useState("");
  const [addingOneOff, setAddingOneOff] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState(null);

  // ── Slot list week navigation ──
  const [weekOffset, setWeekOffset] = useState(0);

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: async () => {
      const res = await fetch(`${API}venues/${venueId}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to load venue.");
      return data;
    },
  });

  // Seed working copy when venue loads
  useEffect(() => {
    if (venue?.weeklySchedule) setSchedule(venue.weeklySchedule);
  }, [venue]);

  const { weekFromStr, weekToStr, weekFromLabel, weekToLabel } = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() + weekOffset * 7);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 6);

    return {
      weekFromStr: formatDate(from),
      weekToStr: formatDate(to),
      weekFromLabel: from.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      weekToLabel: to.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  }, [weekOffset]);

  const { data: allSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ["venue-slots-all", venueId, weekFromStr],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `${API}venues/${venueId}/slots/all?from=${weekFromStr}&to=${weekToStr}`
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to load slots.");
      return data;
    },
  });

  // ── Schedule helpers ──

  const toggleDay = (day) =>
    setNewDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));

  const handleAddEntries = (e) => {
    e.preventDefault();
    setScheduleError("");
    if (!newDays.length) return setScheduleError("Select at least one day.");
    if (!newStart || !newEnd) return setScheduleError("Start and end time are required.");
    if (newEnd <= newStart) return setScheduleError("End time must be after start time.");

    const toAdd = newDays.map((day) => ({ dayOfWeek: day, startTime: newStart, endTime: newEnd }));
    setSchedule((prev) => [...prev, ...toAdd]);
    setNewDays([]);
    setNewStart("");
    setNewEnd("");
  };

  const handleRemoveEntry = (index) => setSchedule((prev) => prev.filter((_, i) => i !== index));

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    setScheduleError("");
    try {
      const res = await fetchWithAuth(`${API}venues/${venueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklySchedule: schedule }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to save schedule.");
      queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
    } catch (err) {
      setScheduleError(err.message);
    } finally {
      setSavingSchedule(false);
    }
  };

  // ── Generate slots ──

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerateError("");
    setGenerateSuccess("");
    if (!fromDate || !toDate) return setGenerateError("Both dates are required.");
    if (toDate <= fromDate) return setGenerateError("End date must be after start date.");
    setGenerating(true);
    try {
      const res = await fetchWithAuth(`${API}venues/${venueId}/slots/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDate, toDate }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to generate slots.");
      setGenerateSuccess(data.message);
      queryClient.invalidateQueries({ queryKey: ["venue-slots-all", venueId], exact: false });
      setFromDate("");
      setToDate("");
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // ── One-off slots ──

  const handleAddOneOff = async (e) => {
    e.preventDefault();
    setOneOffError("");
    if (oneOffEnd && oneOffEnd <= oneOffStart)
      return setOneOffError("End time must be after start time.");
    setAddingOneOff(true);
    try {
      const body = { date: oneOffDate, startTime: oneOffStart };
      if (oneOffEnd) body.endTime = oneOffEnd;
      const res = await fetchWithAuth(`${API}venues/${venueId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to create slot.");
      queryClient.invalidateQueries({ queryKey: ["venue-slots-all", venueId], exact: false });
      setOneOffDate("");
      setOneOffStart("");
      setOneOffEnd("");
    } catch (err) {
      setOneOffError(err.message);
    } finally {
      setAddingOneOff(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    setDeletingSlotId(slotId);
    try {
      const res = await fetchWithAuth(`${API}venues/${venueId}/slot/${slotId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to delete slot.");
      queryClient.invalidateQueries({ queryKey: ["venue-slots-all", venueId], exact: false });
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingSlotId(null);
    }
  };

  // Group schedule entries by day for display
  const scheduleByDay = useMemo(
    () =>
      DAYS.reduce((acc, day) => {
        acc[day] = schedule
          .map((entry, globalIndex) => ({ entry, globalIndex }))
          .filter(({ entry }) => entry.dayOfWeek === day);
        return acc;
      }, {}),
    [schedule]
  );

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

        {/* ── Weekly Schedule ── */}
        <div className="mb-10">
          <h2 className="mb-1 text-xl font-semibold text-base-content">Weekly Schedule</h2>
          <p className="mb-6 text-sm text-base-content/60">
            Define which days and times this venue is available each week. Save the schedule, then
            use Generate Slots to create bookable slots for a date range.
          </p>

          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            {/* Add entry form */}
            <GlassCard className="rounded-4xl p-6 h-fit">
              <h3 className="mb-4 text-base font-semibold text-base-content">Add Entry</h3>
              <form onSubmit={handleAddEntries} className="space-y-4">
                <div>
                  <label className="glass-label">Days *</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { label: "Every Day", days: DAYS },
                      { label: "Weekdays", days: WEEKDAYS },
                      { label: "Weekends", days: WEEKENDS },
                    ].map(({ label, days }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setNewDays(days)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          JSON.stringify([...newDays].sort()) === JSON.stringify([...days].sort())
                            ? "bg-primary text-primary-content border-primary"
                            : "border-base-300 bg-base-100 text-base-content/70 hover:border-primary/40"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {DAYS.map((d) => (
                      <label key={d} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-sm"
                          checked={newDays.includes(d)}
                          onChange={() => toggleDay(d)}
                        />
                        <span className="text-sm text-base-content/80 capitalize">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="glass-label" htmlFor="newStart">
                      Start *
                    </label>
                    <select
                      id="newStart"
                      className="glass-input"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      required
                    >
                      <option value="">Time</option>
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="glass-label" htmlFor="newEnd">
                      End *
                    </label>
                    <select
                      id="newEnd"
                      className="glass-input"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      required
                    >
                      <option value="">Time</option>
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {scheduleError && <p className="text-sm text-red-500">{scheduleError}</p>}
                <Button type="submit" className="w-full">
                  Add to Schedule
                </Button>
              </form>
            </GlassCard>

            {/* Current schedule + save */}
            <div className="space-y-3">
              {schedule.length === 0 ? (
                <GlassCard className="rounded-4xl p-6 text-center">
                  <p className="text-base-content/60">No schedule entries yet.</p>
                </GlassCard>
              ) : (
                DAYS.filter((d) => scheduleByDay[d].length > 0).map((day) => (
                  <div key={day}>
                    <p className="mb-2 text-xs font-semibold tracking-widest text-base-content/50 capitalize">
                      {day}
                    </p>
                    <div className="space-y-2">
                      {scheduleByDay[day].map(({ entry, globalIndex }, i) => (
                        <GlassCard
                          key={i}
                          className="rounded-2xl px-5 py-3 flex items-center justify-between gap-4"
                        >
                          <p className="font-semibold text-base-content">
                            {entry.startTime} — {entry.endTime}
                          </p>
                          <Button
                            variant="danger"
                            className="text-sm"
                            onClick={() => handleRemoveEntry(globalIndex)}
                          >
                            Remove
                          </Button>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                ))
              )}

              <Button
                className="w-full mt-2"
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
              >
                {savingSchedule ? "Saving..." : "Save Schedule"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Generate Slots ── */}
        <div className="mb-10">
          <h2 className="mb-1 text-xl font-semibold text-base-content">Generate Slots</h2>
          <p className="mb-6 text-sm text-base-content/60">
            Create bookable slots from the saved weekly schedule for a specific date range.
          </p>

          <GlassCard className="rounded-4xl p-6 max-w-md">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="glass-label" htmlFor="fromDate">
                    From *
                  </label>
                  <input
                    id="fromDate"
                    type="date"
                    min={today}
                    className="glass-input"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="glass-label" htmlFor="toDate">
                    To *
                  </label>
                  <input
                    id="toDate"
                    type="date"
                    min={fromDate || today}
                    className="glass-input"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              {generateError && <p className="text-sm text-red-500">{generateError}</p>}
              {generateSuccess && <p className="text-sm text-green-600">{generateSuccess}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={generating || !venue?.weeklySchedule?.length}
              >
                {generating ? "Generating..." : "Generate Slots"}
              </Button>
              {!venue?.weeklySchedule?.length && (
                <p className="text-xs text-base-content/50 text-center">
                  Save a weekly schedule first.
                </p>
              )}
            </form>
          </GlassCard>
        </div>

        {/* ── Extra Slots ── */}
        <div>
          <h2 className="mb-1 text-xl font-semibold text-base-content">Extra Slots</h2>
          <p className="mb-6 text-sm text-base-content/60">
            Add slots for specific dates outside the regular schedule, or manage existing ones.
          </p>

          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            <GlassCard className="rounded-4xl p-6 h-fit">
              <h3 className="mb-4 text-base font-semibold text-base-content">Add Extra Slot</h3>
              <form onSubmit={handleAddOneOff} className="space-y-4">
                <div>
                  <label className="glass-label" htmlFor="oneOffDate">
                    Date *
                  </label>
                  <input
                    id="oneOffDate"
                    type="date"
                    min={today}
                    className="glass-input"
                    value={oneOffDate}
                    onChange={(e) => setOneOffDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="glass-label" htmlFor="oneOffStart">
                      Start *
                    </label>
                    <select
                      id="oneOffStart"
                      className="glass-input"
                      value={oneOffStart}
                      onChange={(e) => setOneOffStart(e.target.value)}
                      required
                    >
                      <option value="">Time</option>
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="glass-label" htmlFor="oneOffEnd">
                      End
                    </label>
                    <select
                      id="oneOffEnd"
                      className="glass-input"
                      value={oneOffEnd}
                      onChange={(e) => setOneOffEnd(e.target.value)}
                    >
                      <option value="">Auto (+4h)</option>
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {oneOffError && <p className="text-sm text-red-500">{oneOffError}</p>}
                <Button type="submit" className="w-full" disabled={addingOneOff}>
                  {addingOneOff ? "Adding..." : "Add Slot"}
                </Button>
              </form>
            </GlassCard>

            <div>
              {/* Week navigation */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  className="btn-ghost border border-base-300 cursor-pointer"
                  onClick={() => setWeekOffset((w) => w - 1)}
                >
                  ← Prev
                </Button>
                <p className="text-sm font-semibold text-base-content">
                  {weekFromLabel} — {weekToLabel}
                </p>
                <Button
                  type="button"
                  className="btn-ghost border border-base-300 cursor-pointer"
                  onClick={() => setWeekOffset((w) => w + 1)}
                >
                  Next →
                </Button>
              </div>

              <div className="space-y-2">
                {slotsLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : allSlots.length === 0 ? (
                  <GlassCard className="rounded-4xl p-6 text-center">
                    <p className="text-base-content/60">No slots for this week.</p>
                  </GlassCard>
                ) : (
                  allSlots.map((slot) => (
                    <GlassCard
                      key={slot._id}
                      className="rounded-2xl px-5 py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold text-base-content">
                          {slot.startTime} — {slot.endTime}
                        </p>
                        <p className="text-sm text-base-content/60">
                          {new Date(slot.date).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {slot.source === "schedule" && (
                            <span className="ml-2 text-xs text-base-content/40">recurring</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${slot.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                        >
                          {slot.isAvailable ? "Available" : "Booked"}
                        </span>
                        {slot.isAvailable && (
                          <Button
                            variant="danger"
                            className="text-sm"
                            disabled={deletingSlotId === slot._id}
                            onClick={() => handleDeleteSlot(slot._id)}
                          >
                            {deletingSlotId === slot._id ? "Deleting..." : "Delete"}
                          </Button>
                        )}
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
