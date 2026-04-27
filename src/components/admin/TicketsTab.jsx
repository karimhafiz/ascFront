import React, { useState, useMemo } from "react";
import SortableHeader from "../common/SortableHeader";
import { formatDate, usePagination } from "./adminHelpers";
import Pagination from "./Pagination";

function groupByPayment(tickets) {
  const map = new Map();
  for (const t of tickets) {
    const key = t.paymentId || t._id;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  }
  return Array.from(map.values());
}

const PrintBtn = ({ group, small }) => {
  const first = group[0];
  if (!first.ticketCode) return null;
  const isMulti = group.length > 1;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        const codes = group
          .map((t) => t.ticketCode)
          .filter(Boolean)
          .join(",");
        const url = isMulti
          ? `/tickets/${first.ticketCode}?codes=${codes}&print=true`
          : `/tickets/${first.ticketCode}?print=true`;
        window.open(url, "_blank");
      }}
      className={`rounded-lg hover:bg-base-200 text-base-content/60 hover:text-primary transition-colors cursor-pointer ${small ? "p-1.5" : "p-2"}`}
      title={isMulti ? `Print all ${group.length} tickets` : "Print ticket"}
    >
      <svg
        className={small ? "w-4 h-4" : "w-5 h-5"}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
    </button>
  );
};

const Chevron = ({ open, className = "" }) => (
  <svg
    className={`w-4 h-4 text-base-content/40 transition-transform ${open ? "rotate-180" : ""} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ViewToggle = ({ view, setView, options }) => (
  <div className="flex bg-base-200 rounded-xl p-1 gap-1">
    {options.map((v) => (
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
);

export default function TicketsTab({ tickets }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("byEvent");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    if (!search) return tickets;
    const q = search.toLowerCase();
    return tickets.filter(
      (t) =>
        t.buyerEmail?.toLowerCase().includes(q) ||
        t.eventId?.title?.toLowerCase().includes(q) ||
        t.ticketCode?.toLowerCase().includes(q)
    );
  }, [tickets, search]);

  // -- By Event --
  const eventGroups = useMemo(() => {
    const map = new Map();
    for (const t of filtered) {
      const eid = t.eventId?._id || "unknown";
      if (!map.has(eid)) {
        map.set(eid, {
          eventId: eid,
          title: t.eventId?.title || "Unknown Event",
          date: t.eventId?.date,
          ticketPrice: t.eventId?.ticketPrice ?? 0,
          tickets: [],
        });
      }
      map.get(eid).tickets.push(t);
    }
    return Array.from(map.values());
  }, [filtered]);

  // -- All --
  const groups = useMemo(() => groupByPayment(filtered), [filtered]);
  const sorted = useMemo(() => {
    if (!sort.key) return groups;
    return [...groups].sort((a, b) => {
      const fa = a[0],
        fb = b[0];
      let va, vb;
      if (sort.key === "date") {
        va = new Date(fa.createdAt);
        vb = new Date(fb.createdAt);
      } else if (sort.key === "paid") {
        va = (fa.eventId?.ticketPrice ?? 0) * a.length;
        vb = (fb.eventId?.ticketPrice ?? 0) * b.length;
      } else if (sort.key === "quantity") {
        va = a.length;
        vb = b.length;
      }
      return sort.dir === "asc" ? va - vb : vb - va;
    });
  }, [groups, sort]);

  const totalTickets = filtered.length;
  const pg = usePagination(sorted, [search, sort.key, sort.dir]);

  const toggleEvent = (eid) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eid)) next.delete(eid);
      else next.add(eid);
      return next;
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by buyer email, event, or ticket code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input w-full sm:flex-1 sm:w-auto"
        />
        <ViewToggle
          view={view}
          setView={setView}
          options={[
            { key: "byEvent", label: "By Event" },
            { key: "all", label: "All" },
          ]}
        />
      </div>

      {/* ── By Event view ── */}
      {view === "byEvent" && (
        <div className="space-y-4">
          {eventGroups.length === 0 && (
            <p className="text-center text-base-content/50 py-12">No tickets found</p>
          )}
          {eventGroups.map((group) => {
            const isOpen = expandedEvents.has(group.eventId);
            const orders = groupByPayment(group.tickets);
            const revenue = group.tickets.reduce(
              (sum, t) => sum + (t.eventId?.ticketPrice ?? 0),
              0
            );
            return (
              <div
                key={group.eventId}
                className="rounded-2xl border border-base-300 shadow-sm overflow-hidden bg-white"
              >
                <button
                  onClick={() => toggleEvent(group.eventId)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-base-200/30 transition-colors cursor-pointer"
                >
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-base-content">{group.title}</p>
                    {group.date && (
                      <p className="text-xs text-base-content/50 mt-0.5">
                        {formatDate(group.date)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs bg-base-200 text-base-content/70 px-2.5 py-0.5 rounded-full">
                      {group.tickets.length} ticket{group.tickets.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs font-medium text-green-700">
                      £{revenue.toFixed(2)}
                    </span>
                    <Chevron open={isOpen} />
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-base-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-base-100/50 text-left">
                            <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50">
                              Buyer Email
                            </th>
                            <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50">
                              Qty
                            </th>
                            <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50">
                              Paid
                            </th>
                            <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50 hidden sm:table-cell">
                              Date
                            </th>
                            <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50 hidden md:table-cell">
                              Ref
                            </th>
                            <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50 text-center">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-base-100">
                          {orders.map((order) => {
                            const first = order[0];
                            const key = first.paymentId || first._id;
                            return (
                              <tr
                                key={key}
                                className="hover:bg-base-200/30 transition-colors cursor-pointer"
                                onClick={() =>
                                  first.ticketCode &&
                                  window.open(`/tickets/${first.ticketCode}`, "_blank")
                                }
                              >
                                <td className="px-3 sm:px-4 py-3 text-base-content/70 truncate max-w-[120px] sm:max-w-none">
                                  {first.buyerEmail}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-base-content/70">
                                  {order.length}
                                  {order.length > 1 && (
                                    <span className="text-[10px] text-base-content/40 ml-1 hidden sm:inline">
                                      tickets
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-green-700 font-medium">
                                  £{((first.eventId?.ticketPrice ?? 0) * order.length).toFixed(2)}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-base-content/50 hidden sm:table-cell">
                                  {formatDate(first.createdAt)}
                                </td>
                                <td className="px-3 sm:px-4 py-3 font-mono text-[11px] text-base-content/40 hidden md:table-cell">
                                  {first.paymentId
                                    ? "\u2026" + first.paymentId.slice(-8)
                                    : "\u2014"}
                                </td>
                                <td className="px-3 sm:px-4 py-3">
                                  <div className="flex items-center justify-center">
                                    <PrintBtn group={order} />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {eventGroups.length > 0 && (
            <p className="text-xs text-base-content/50 mt-3">
              {totalTickets} ticket{totalTickets !== 1 ? "s" : ""} &middot; {eventGroups.length}{" "}
              event{eventGroups.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* ── All view ── */}
      {view === "all" && (
        <>
          <div className="rounded-2xl border border-base-300 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
                  <th className="px-2 sm:px-4 py-3 w-8 hidden sm:table-cell" />
                  <th className="px-3 sm:px-4 py-3 font-semibold text-base-content">Event</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold text-base-content hidden md:table-cell">
                    Buyer Email
                  </th>
                  <SortableHeader label="Qty" sortKey="quantity" sort={sort} onSort={setSort} />
                  <SortableHeader label="Paid" sortKey="paid" sort={sort} onSort={setSort} />
                  <SortableHeader label="Date" sortKey="date" sort={sort} onSort={setSort} />
                  <th className="px-3 sm:px-4 py-3 font-semibold text-base-content hidden lg:table-cell">
                    Ref
                  </th>
                  <th className="px-3 sm:px-4 py-3 font-semibold text-base-content text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {pg.paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-base-content/50">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  pg.paged.map((group) => {
                    const first = group[0];
                    const key = first.paymentId || first._id;
                    const isMulti = group.length > 1;
                    const isExpanded = expanded === key;
                    return (
                      <React.Fragment key={key}>
                        <tr
                          className="bg-white hover:bg-base-200/30 transition-colors cursor-pointer"
                          onClick={() => {
                            if (isMulti) setExpanded(isExpanded ? null : key);
                            else if (first.ticketCode)
                              window.open(`/tickets/${first.ticketCode}`, "_blank");
                          }}
                        >
                          <td className="px-2 sm:px-4 py-3 hidden sm:table-cell">
                            {isMulti && (
                              <svg
                                className={`w-4 h-4 text-base-content/40 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-3 font-medium text-base-content">
                            <span className="block truncate max-w-[140px] sm:max-w-none">
                              {first.eventId?.title ?? "\u2014"}
                            </span>
                            <span className="block text-xs text-base-content/50 md:hidden truncate">
                              {first.buyerEmail}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-base-content/70 hidden md:table-cell">
                            {first.buyerEmail}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-base-content/70">
                            {group.length}
                            {isMulti && (
                              <span className="text-[10px] text-base-content/40 ml-1 hidden sm:inline">
                                tickets
                              </span>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-green-700 font-medium">
                            £{((first.eventId?.ticketPrice ?? 0) * group.length).toFixed(2)}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-base-content/50">
                            {formatDate(first.createdAt)}
                          </td>
                          <td className="px-3 sm:px-4 py-3 font-mono text-[11px] text-base-content/40 hidden lg:table-cell">
                            {first.paymentId ? "\u2026" + first.paymentId.slice(-8) : "\u2014"}
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <PrintBtn group={group} />
                            </div>
                          </td>
                        </tr>
                        {isMulti &&
                          isExpanded &&
                          group.map((t) => (
                            <tr
                              key={t._id}
                              className="bg-base-100/50 hover:bg-base-200/40 transition-colors cursor-pointer"
                              onClick={() =>
                                t.ticketCode && window.open(`/tickets/${t.ticketCode}`, "_blank")
                              }
                            >
                              <td className="px-2 sm:px-4 py-2 hidden sm:table-cell" />
                              <td className="px-3 sm:px-4 py-2 text-base-content/50 text-xs sm:pl-8">
                                <span className="font-mono">{t.ticketCode ?? "\u2014"}</span>
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-base-content/50 text-xs hidden md:table-cell">
                                {t.buyerEmail}
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-base-content/50 text-xs">1</td>
                              <td className="px-3 sm:px-4 py-2 text-green-700/70 text-xs font-medium">
                                £{(first.eventId?.ticketPrice ?? 0).toFixed(2)}
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-base-content/40 text-xs">
                                {t.checkedIn ? (
                                  <span className="text-green-600 font-medium">Checked in</span>
                                ) : (
                                  "Not checked in"
                                )}
                              </td>
                              <td className="px-3 sm:px-4 py-2 hidden lg:table-cell" />
                              <td className="px-3 sm:px-4 py-2 text-center">
                                <PrintBtn group={[t]} small />
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pg.page}
            totalPages={pg.totalPages}
            setPage={pg.setPage}
            total={totalTickets}
            label={`ticket${totalTickets !== 1 ? "s" : ""} \u00b7 ${sorted.length} order${sorted.length !== 1 ? "s" : ""}`}
          />
        </>
      )}
    </div>
  );
}
