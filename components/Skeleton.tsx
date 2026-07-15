export function CardSkeleton({ h = "h-20" }: { h?: string }) {
  return (
    <div
      className={`${h} animate-pulse rounded-md border border-border bg-surface-2`}
    />
  );
}

export function PageSkeleton({
  title = true,
  cards = 3,
}: {
  title?: boolean;
  cards?: number;
}) {
  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-9">
      {title && (
        <div className="mb-7 flex flex-col gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
          <div className="h-7 w-40 animate-pulse rounded bg-surface-2" />
        </div>
      )}
      <div className="flex flex-col gap-3">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
