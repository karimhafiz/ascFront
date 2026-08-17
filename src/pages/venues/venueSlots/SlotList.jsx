import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, GlassCard, Spinner } from "../../../components/ui";
import { fetchWithAuth } from "../../../auth/auth";
import { formatDate } from "../../../util/util";
import TimeSelect from "./TimeSelect";
import { queryKeys } from "../../../api/queryKeys";

const API = import.meta.env.VITE_DEV_URI;

export default function SlotList({ venueId }) {
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const [oneOffForm, setOneOffForm] = useState({ date: "", start: "", end: "", error: "" });
  const [addingOneOff, setAddingOneOff] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState(null);

  const today = formatDate(new Date());

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
    queryKey: queryKeys.venues.slotsAll(venueId, weekFromStr, weekToStr),
    queryFn: async () => {
      const res = await fetchWithAuth(
        `${API}venues/${venueId}/slots/all?from=${weekFromStr}&to=${weekToStr}`
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to load slots.");
      return data;
    },
  });

  const handleAddOneOff = async (e) => {
    e.preventDefault();
    setOneOffForm((prev) => ({ ...prev, error: "" }));
    if (oneOffForm.end && oneOffForm.end <= oneOffForm.start) {
      return setOneOffForm((prev) => ({ ...prev, error: "End time must be after start time." }));
    }
    setAddingOneOff(true);
    try {
      const body = { date: oneOffForm.date, startTime: oneOffForm.start };
      if (oneOffForm.end) body.endTime = oneOffForm.end;
      const res = await fetchWithAuth(`${API}venues/${venueId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to create slot.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.slotsAll(venueId),
        exact: false,
      });
      setOneOffForm({ date: "", start: "", end: "", error: "" });
    } catch (err) {
      setOneOffForm((prev) => ({ ...prev, error: err.message }));
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.slotsAll(venueId),
        exact: false,
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingSlotId(null);
    }
  };

  return (
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
                value={oneOffForm.date}
                onChange={(e) => setOneOffForm((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="glass-label" htmlFor="oneOffStart">
                  Start *
                </label>
                <TimeSelect
                  id="oneOffStart"
                  value={oneOffForm.start}
                  onChange={(e) => setOneOffForm((prev) => ({ ...prev, start: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="glass-label" htmlFor="oneOffEnd">
                  End
                </label>
                <TimeSelect
                  id="oneOffEnd"
                  value={oneOffForm.end}
                  onChange={(e) => setOneOffForm((prev) => ({ ...prev, end: e.target.value }))}
                  placeholder="Auto (+4h)"
                />
              </div>
            </div>
            {oneOffForm.error && <p className="text-sm text-red-500">{oneOffForm.error}</p>}
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
  );
}
