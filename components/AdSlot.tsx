export function AdSlot({ kind = "banner", className = "" }: { kind?: "banner" | "rail" | "mobile"; className?: string }) {
  const size = kind === "rail" ? "300 × 600" : kind === "mobile" ? "320 × 100" : "반응형 배너";
  return <aside className={`ad-placeholder ad-${kind} ${className}`.trim()} data-ad-slot={kind} data-ad-size={size} aria-hidden="true" />;
}
