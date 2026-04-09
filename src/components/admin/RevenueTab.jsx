import { useState } from "react";
import { Bar } from "react-chartjs-2";
import SortableHeader from "../common/SortableHeader";

export default function RevenueTab({ events }) {
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const chartData = {
    labels: events.map((e) => e.title),
    datasets: [
      {
        label: "Revenue (£)",
        data: events.map((e) => e.totalRevenue ?? 0),
        backgroundColor: "rgba(59, 130, 172, 0.6)",
        borderColor: "rgba(59, 130, 172, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const totalRevenue = events.reduce((sum, e) => sum + (e.totalRevenue ?? 0), 0);

  const sorted = [...events].sort((a, b) => {
    if (!sort.key) return 0;
    let va, vb;
    if (sort.key === "event")
      return sort.dir === "asc"
        ? (a.title ?? "").localeCompare(b.title ?? "")
        : (b.title ?? "").localeCompare(a.title ?? "");
    if (sort.key === "revenue") {
      va = a.totalRevenue ?? 0;
      vb = b.totalRevenue ?? 0;
    } else if (sort.key === "tickets") {
      va = a.ticketsAvailable ?? 0;
      vb = b.ticketsAvailable ?? 0;
    } else if (sort.key === "price") {
      va = a.ticketPrice ?? 0;
      vb = b.ticketPrice ?? 0;
    }
    return sort.dir === "asc" ? va - vb : vb - va;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
          <p className="text-xs text-base-content/50 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-base-content">£{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
          <p className="text-xs text-base-content/50 mb-1">Events with Sales</p>
          <p className="text-2xl font-bold text-base-content">
            {events.filter((e) => (e.totalRevenue ?? 0) > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
          <p className="text-xs text-base-content/50 mb-1">Total Events</p>
          <p className="text-2xl font-bold text-base-content">{events.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
        <div className="h-72">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { callback: (v) => "£" + v } } },
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
              <SortableHeader label="Event" sortKey="event" sort={sort} onSort={setSort} />
              <SortableHeader label="Revenue" sortKey="revenue" sort={sort} onSort={setSort} />
              <SortableHeader label="Tickets Left" sortKey="tickets" sort={sort} onSort={setSort} />
              <SortableHeader label="Price/ticket" sortKey="price" sort={sort} onSort={setSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-base-100">
            {sorted.map((e) => (
              <tr key={e._id} className="bg-white hover:bg-base-200/30 transition-colors">
                <td className="px-4 py-3 font-medium text-base-content">{e.title}</td>
                <td className="px-4 py-3 text-green-700 font-medium">
                  £{(e.totalRevenue ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-base-content/70">{e.ticketsAvailable ?? "—"}</td>
                <td className="px-4 py-3 text-base-content/70">
                  £{(e.ticketPrice ?? 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
