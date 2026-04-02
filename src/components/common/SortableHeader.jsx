import React from "react";

export default function SortableHeader({ label, sortKey, sort, onSort }) {
  const isActive = sort.key === sortKey;

  const handleClick = () => {
    if (!isActive) {
      onSort({ key: sortKey, dir: "asc" });
    } else if (sort.dir === "asc") {
      onSort({ key: sortKey, dir: "desc" });
    } else {
      onSort({ key: null, dir: "asc" });
    }
  };

  return (
    <th
      onClick={handleClick}
      className="px-4 py-3 font-semibold text-purple-700 cursor-pointer select-none hover:text-purple-900 transition-colors"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          <svg
            className={`w-3 h-3 transition-transform ${sort.dir === "desc" ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
        {!isActive && (
          <svg
            className="w-3 h-3 text-purple-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        )}
      </span>
    </th>
  );
}
