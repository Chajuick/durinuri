export function MemberBadge({
  name,
  variant,
}: {
  name: string;
  variant: "me" | "you";
}) {
  const cls =
    variant === "me"
      ? "bg-primary-bg text-primary-ink"
      : "bg-you-bg text-you-ink";
  return (
    <span
      className={`inline-flex h-fit items-center rounded-full px-2.5 py-[3px] text-[11px] font-extrabold ${cls}`}
    >
      {name}
    </span>
  );
}
