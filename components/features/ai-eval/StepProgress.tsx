'use client';

export function StepProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5">
      {([1, 2, 3] as const).map(s => (
        <div
          key={s}
          className={`rounded-full transition-all duration-300 ${
            s === current
              ? 'w-5 h-1.5 bg-primary'
              : s < current
              ? 'w-1.5 h-1.5 bg-primary/40'
              : 'w-1.5 h-1.5 bg-muted-foreground/20'
          }`}
        />
      ))}
    </div>
  );
}
