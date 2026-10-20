export function CarCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md">
      {/* Image placeholder */}
      <div className="aspect-[16/10] w-full bg-surface-2 animate-pulse" />
      {/* Info placeholder */}
      <div className="p-5 space-y-4">
        {/* Brand + rating */}
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-16 bg-border rounded-full animate-pulse" />
          <div className="h-2.5 w-10 bg-border rounded-full animate-pulse" />
        </div>
        {/* Title */}
        <div className="h-6 w-3/4 bg-border rounded-lg animate-pulse" />
        {/* Spec pills */}
        <div className="flex gap-2">
          <div className="h-7 w-20 bg-border rounded-lg animate-pulse" />
          <div className="h-7 w-24 bg-border rounded-lg animate-pulse" />
          <div className="h-7 w-12 bg-border rounded-lg animate-pulse" />
        </div>
        {/* Divider */}
        <div className="h-px bg-border" />
        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-28 bg-border rounded-lg animate-pulse" />
          <div className="h-8 w-24 bg-border rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="premium-card rounded-[2.5rem] p-8 shadow-2xl">
      <div className="skeleton h-16 w-16 rounded-2xl mb-8" />
      <div className="skeleton h-3 w-24 mb-4" />
      <div className="skeleton h-10 w-20" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[200] transition-colors duration-500">
      <div className="text-center">
        <div className="w-24 h-24 border-[6px] border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-10 shadow-3xl shadow-theme-accent/20" />
        <p className="text-theme-accent font-black text-[12px] uppercase tracking-[0.5em] animate-pulse">Initializing Luxury Experience</p>
      </div>
    </div>
  );
}
