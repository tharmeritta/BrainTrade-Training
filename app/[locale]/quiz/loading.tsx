export default function QuizLoading() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded bg-primary/20 animate-pulse" />
          <div className="h-3 w-24 rounded bg-primary/20 animate-pulse" />
        </div>
        <div className="h-8 w-48 rounded-lg bg-foreground/10 animate-pulse mb-2" />
        <div className="h-4 w-64 rounded bg-foreground/5 animate-pulse" />
      </div>

      {/* Card skeletons */}
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-border"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-12 h-12 rounded-xl bg-foreground/8 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-foreground/10 animate-pulse" />
              <div className="h-3 w-56 rounded bg-foreground/5 animate-pulse" />
              <div className="h-4 w-16 rounded-full bg-foreground/5 animate-pulse" />
            </div>
            <div className="w-4 h-4 rounded bg-foreground/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
