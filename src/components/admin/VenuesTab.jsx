import { useState, useMemo } from "react";
import SortableHeader from "../common/SortableHeader";
import { usePagination } from "./adminHelpers";
import Pagination from "./Pagination";

const BOOKING_STATUS = {
  confirmed: { label: "Confirmed", classes: "bg-green-50 text-green-700 border-green-200" },
  pending: { label: "Pending", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  completed: { label: "Completed", classes: "bg-blue-50 text-blue-600 border-blue-200" },
  cancelled: { label: "Cancelled", classes: "bg-red-50 text-red-600 border-red-200" },
};

const StatusBadge = ({ status }) => {
  const st = BOOKING_STATUS[status] ?? {
    label: status ?? "Unknown",
    classes: "bg-base-100 text-base-content/50 border-base-300",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.classes}`}>
      {st.label}
    </span>
  );
};

const Chevron = ({ open }) => (
  <svg
    className={`w-4 h-4 text-base-content/40 transition-transform ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

function slotDate(slot) {
  if (!slot?.date) return "—";
  return new Date(slot.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function VenuesTab({ venueBookings }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("byVenue");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [expandedVenues, setExpandedVenues] = useState(new Set());

  const filtered = useMemo(() => {
    if (!search) return venueBookings;
    const q = search.toLowerCase();
    return venueBookings.filter(
      (b) =>
        b.venue?.name?.toLowerCase().includes(q) ||
        b.user?.email?.toLowerCase().includes(q) ||
        b.user?.name?.toLowerCase().includes(q) ||
        b.eventName?.toLowerCase().includes(q)
    );
  }, [venueBookings, search]);

  // -- By Venue grouping --
  const venueGroups = useMemo(() => {
    const map = new Map();
    for (const b of filtered) {
      const vid = b.venue?._id || "unknown";
      if (!map.has(vid)) {
        map.set(vid, {
          venueId: vid,
          name: b.venue?.name || "Unknown Venue",
          city: b.venue?.city,
          bookings: [],
        });
      }
      map.get(vid).bookings.push(b);
    }
    return Array.from(map.values());
  }, [filtered]);

  // -- Flat sorted --
  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    return [...filtered].sort((a, b) => {
      let va, vb;
      if (sort.key === "date") {
        va = new Date(a.slot?.date ?? a.createdAt);
        vb = new Date(b.slot?.date ?? b.createdAt);
      } else if (sort.key === "price") {
        va = a.totalPrice ?? 0;
        vb = b.totalPrice ?? 0;
      } else if (sort.key === "status") {
        const order = { confirmed: 0, pending: 1, completed: 2, cancelled: 3 };
        va = order[a.status] ?? 4;
        vb = order[b.status] ?? 4;
      }
      return sort.dir === "asc" ? va - vb : vb - va;
    });
  }, [filtered, sort]);

  const pg = usePagination(sorted, [search, sort.key, sort.dir]);

  const toggleVenue = (vid) => {
    setExpandedVenues((prev) => {
      const next = new Set(prev);
      if (next.has(vid)) next.delete(vid);
      else next.add(vid);
      return next;
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by venue, user, or event name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input w-full sm:flex-1 sm:w-auto"
        />
        <div className="flex bg-base-200 rounded-xl p-1 gap-1">
          {[
            { key: "byVenue", label: "By Venue" },
            { key: "all", label: "All" },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                view === v.key
                  ? "bg-white shadow-sm text-base-content"
                  : "text-base-content/50 hover:text-base-content"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── By Venue view ── */}
      {view === "byVenue" && (
        <div className="space-y-4">
          {venueGroups.length === 0 && (
            <p className="text-center text-base-content/50 py-12">No bookings found</p>
          )}
          {venueGroups.map((group) => {
            const isOpen = expandedVenues.has(group.venueId);
            const revenue = group.bookings
              .filter((b) => b.status !== "cancelled")
              .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);
            return (
              <div
                key={group.venueId}
                className="rounded-2xl border border-base-300 shadow-sm overflow-hidden bg-white"
              >
                <button
                  onClick={() => toggleVenue(group.venueId)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-base-200/30 transition-colors cursor-pointer"
                >
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-base-content">{group.name}</p>
                    {group.city && (
                      <p className="text-xs text-base-content/50 mt-0.5">{group.city}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs bg-base-200 text-base-content/70 px-2.5 py-0.5 rounded-full">
                      {group.bookings.length} booking{group.bookings.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs font-medium text-green-700">
                      £{revenue.toFixed(2)}
                    </span>
                    <Chevron open={isOpen} />
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-base-200 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-base-100/50 text-left">
                          <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50">
                            User
                          </th>
                          <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50 hidden sm:table-cell">
                            Event Name
                          </th>
                          <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50">
                            Date
                          </th>
                          <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50 hidden md:table-cell">
                            Time
                          </th>
                          <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50">
                            Price
                          </th>
                          <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50">
                            Status
                          </th>
                          <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50 hidden lg:table-cell">
                            Ref
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-base-100">
                        {group.bookings.map((b) => (
                          <tr key={b._id} className="hover:bg-base-200/30 transition-colors">
                            <td className="px-3 sm:px-4 py-3 text-base-content truncate max-w-[120px] sm:max-w-none">
                              <span className="block">{b.user?.name || "—"}</span>
                              <span className="block text-xs text-base-content/80">
                                {b.user?.email}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-base-content/70 hidden sm:table-cell truncate max-w-[140px]">
                              {b.eventName || "—"}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-base-content/70">
                              {slotDate(b.slot)}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-base-content/50 hidden md:table-cell">
                              {b.slot?.startTime && b.slot?.endTime
                                ? `${b.slot.startTime} – ${b.slot.endTime}`
                                : "—"}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-green-700 font-medium">
                              £{(b.totalPrice ?? 0).toFixed(2)}
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                              <StatusBadge status={b.status} />
                            </td>
                            <td className="px-3 sm:px-4 py-3 font-mono text-[11px] text-base-content/40 hidden lg:table-cell">
                              {b.bookingCode ?? `#${b._id.slice(-8).toUpperCase()}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          {venueGroups.length > 0 && (
            <p className="text-xs text-base-content/50 mt-3">
              {filtered.length} booking{filtered.length !== 1 ? "s" : ""} &middot;{" "}
              {venueGroups.length} venue{venueGroups.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* ── All flat view ── */}
      {view === "all" && (
        <>
          <div className="rounded-2xl border border-base-300 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
                  <th className="px-3 sm:px-4 py-3 font-semibold text-base-content">Venue</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold text-base-content hidden md:table-cell">
                    User
                  </th>
                  <th className="px-3 sm:px-4 py-3 font-semibold text-base-content hidden lg:table-cell">
                    Event Name
                  </th>
                  <SortableHeader label="Date" sortKey="date" sort={sort} onSort={setSort} />
                  <SortableHeader label="Price" sortKey="price" sort={sort} onSort={setSort} />
                  <SortableHeader label="Status" sortKey="status" sort={sort} onSort={setSort} />
                  <th className="px-3 sm:px-4 py-3 font-semibold text-base-content hidden lg:table-cell">
                    Ref
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {pg.paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-base-content/50">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  pg.paged.map((b) => (
                    <tr key={b._id} className="bg-white hover:bg-base-200/30 transition-colors">
                      <td className="px-3 sm:px-4 py-3 font-medium text-base-content">
                        <span className="block truncate max-w-[140px] sm:max-w-none">
                          {b.venue?.name ?? "—"}
                        </span>
                        <span className="block text-xs text-base-content/50 md:hidden truncate">
                          {b.user?.email}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-base-content/70 hidden md:table-cell">
                        <span className="block">{b.user?.name || "—"}</span>
                        <span className="block text-xs text-base-content/40">{b.user?.email}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-base-content/70 hidden lg:table-cell truncate max-w-[140px]">
                        {b.eventName || "—"}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-base-content/70">{slotDate(b.slot)}</td>
                      <td className="px-3 sm:px-4 py-3 text-green-700 font-medium">
                        £{(b.totalPrice ?? 0).toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-mono text-[11px] text-base-content/40 hidden lg:table-cell">
                        {b.bookingCode ?? `#${b._id.slice(-8).toUpperCase()}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pg.page}
            totalPages={pg.totalPages}
            setPage={pg.setPage}
            total={filtered.length}
            label={`booking${filtered.length !== 1 ? "s" : ""}`}
          />
        </>
      )}
    </div>
  );
}
