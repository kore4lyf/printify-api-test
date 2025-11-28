export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-8 bg-slate-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(count).fill(null).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-slate-200 rounded w-3/4" />
      <div className="h-6 bg-slate-200 rounded w-full" />
      <div className="h-6 bg-slate-200 rounded w-5/6" />
      <div className="h-10 bg-slate-200 rounded w-1/4" />
    </div>
  );
}
