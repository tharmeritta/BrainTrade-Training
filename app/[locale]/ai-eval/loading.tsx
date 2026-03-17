export default function AiEvalLoading() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded bg-primary/20 animate-pulse" />
          <div className="h-3 w-24 rounded bg-primary/20 animate-pulse" />
        </div>
        <div className="h-8 w-44 rounded-lg bg-foreground/10 animate-pulse mb-2" />
        <div className="h-4 w-72 rounded bg-foreground/5 animate-pulse" />
      </div>

      {/* Level cards skeleton */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="p-4 rounded-2xl border-2 border-border space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-foreground/10 animate-pulse" />
            <div className="h-4 w-20 rounded bg-foreground/10 animate-pulse" />
            <div className="h-3 w-full rounded bg-foreground/5 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-foreground/5 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <div className="h-12 w-full rounded-xl bg-primary/20 animate-pulse" />
    </div>
  );
}
