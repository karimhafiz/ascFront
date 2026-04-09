import React, { useState } from "react";
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

export default function TicketsTab({ tickets }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [expanded, setExpanded] = useState(null);

  const groups = groupByPayment(tickets);

  const filtered = groups.filter((g) => {
    const q = search.toLowerCase();
    return g.some(
      (t) =>
        t.buyerEmail?.toLowerCase().includes(q) ||
        t.eventId?.title?.toLowerCase().includes(q) ||
        t.ticketCode?.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sort.key) return 0;
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

  const totalTickets = filtered.reduce((sum, g) => sum + g.length, 0);
  const pg = usePagination(sorted, [search, sort.key, sort.dir]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search by buyer email, event, or ticket code…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="glass-input mb-4"
      />
      <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
              <th className="px-4 py-3 w-8" />
              <th className="px-4 py-3 font-semibold text-base-content">Event</th>
              <th className="px-4 py-3 font-semibold text-base-content">Buyer Email</th>
              <SortableHeader label="Qty" sortKey="quantity" sort={sort} onSort={setSort} />
              <SortableHeader label="Paid" sortKey="paid" sort={sort} onSort={setSort} />
              <SortableHeader label="Date" sortKey="date" sort={sort} onSort={setSort} />
              <th className="px-4 py-3 font-semibold text-base-content">Ref</th>
              <th className="px-4 py-3 font-semibold text-base-content">Actions</th>
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
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 font-medium text-base-content">
                        {first.eventId?.title ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-base-content/70">{first.buyerEmail}</td>
                      <td className="px-4 py-3 text-base-content/70">
                        {group.length}
                        {isMulti && (
                          <span className="text-[10px] text-base-content/40 ml-1">tickets</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-green-700 font-medium">
                        £{((first.eventId?.ticketPrice ?? 0) * group.length).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-base-content/50">
                        {formatDate(first.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-base-content/40">
                        {first.paymentId ? "…" + first.paymentId.slice(-8) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!isMulti && first.ticketCode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/tickets/${first.ticketCode}?print=true`, "_blank");
                              }}
                              className="p-1.5 rounded-lg hover:bg-base-200 text-base-content/50 hover:text-primary transition-colors cursor-pointer"
                              title="Print ticket"
                            >
                              <svg
                                className="w-4 h-4"
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
                          )}
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
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2 text-base-content/50 text-xs pl-8">
                            <span className="font-mono">{t.ticketCode ?? "—"}</span>
                          </td>
                          <td className="px-4 py-2 text-base-content/50 text-xs">{t.buyerEmail}</td>
                          <td className="px-4 py-2 text-base-content/50 text-xs">1</td>
                          <td className="px-4 py-2 text-green-700/70 text-xs font-medium">
                            £{(first.eventId?.ticketPrice ?? 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-base-content/40 text-xs">
                            {t.checkedIn ? (
                              <span className="text-green-600 font-medium">Checked in</span>
                            ) : (
                              "Not checked in"
                            )}
                          </td>
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2">
                            {t.ticketCode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/tickets/${t.ticketCode}?print=true`, "_blank");
                                }}
                                className="p-1 rounded-lg hover:bg-base-200 text-base-content/50 hover:text-primary transition-colors cursor-pointer"
                                title="Print ticket"
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
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                  />
                                </svg>
                              </button>
                            )}
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
        label={`ticket${totalTickets !== 1 ? "s" : ""} · ${sorted.length} order${sorted.length !== 1 ? "s" : ""}`}
      />
    </div>
  );
}
