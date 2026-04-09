export default function Pagination({ page, totalPages, setPage, total, label }) {
  if (totalPages <= 1) {
    return (
      <p className="text-xs text-base-content/50 mt-3">
        {total} {label}
      </p>
    );
  }
  const range = [];
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + 4);
  start = Math.max(1, end - 4);
  for (let i = start; i <= end; i++) range.push(i);

  return (
    <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
      <p className="text-xs text-base-content/50">
        {total} {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="px-2 py-1 rounded-lg text-xs font-medium text-base-content/50 hover:text-base-content hover:bg-base-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        {range.map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`min-w-[28px] px-1.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              n === page
                ? "bg-primary text-white shadow-sm"
                : "text-base-content/50 hover:text-base-content hover:bg-base-200"
            }`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="px-2 py-1 rounded-lg text-xs font-medium text-base-content/50 hover:text-base-content hover:bg-base-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
