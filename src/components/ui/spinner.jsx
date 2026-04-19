import { Loader2 } from "lucide-react";

export function Spinner({ size = "md", className }) {
  const s = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";
  return <Loader2 className={`${s} animate-spin text-accent ${className || ""}`} />;
}

export function PageLoader() {
  return (
    <div className="page-enter space-y-6 p-4">
      <div className="skeleton h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-10 rounded-none" />
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 border-b border-line">
          {[...Array(cols)].map((_, c) => (
            <div key={c} className="skeleton h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
