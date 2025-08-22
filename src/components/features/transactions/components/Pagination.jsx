export default function Pagination({
  currentPage,
  totalPages,
  onFirst,
  onPrev,
  onJump,
  onNext,
  onLast,
}) {
  const pages = (() => {
    const out = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjStart = Math.max(1, end - 4);
    if (adjStart > 1) {
      out.push(1);
      if (adjStart > 2) out.push("...");
    }
    for (let i = adjStart; i <= end; i++) out.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) out.push("...");
      out.push(totalPages);
    }
    return out;
  })();

  return (
    <div className="w-full px-4 sm:px-6 py-2 border-t border-slate-200 bg-white sticky bottom-0">
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <button
          onClick={onFirst}
          disabled={currentPage === 1}
          className="px-2 py-1 border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
        >
          First
        </button>
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="px-2 py-1 border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onJump(p)}
                className={`px-3 py-1 rounded-md text-sm cursor-pointer ${
                  currentPage === p ? "bg-indigo-600 text-white" : "hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
        >
          Next
        </button>
        <button
          onClick={onLast}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
        >
          Last
        </button>
      </div>
    </div>
  );
}
