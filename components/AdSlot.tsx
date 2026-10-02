import { HOUSE_AD } from "@/lib/site-config";

// Rush's own favicon mark, inlined so the ad needs no extra request.
function RushMark() {
  return <svg className="house-ad-mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#101b2a" /><path d="M8 23V9h10l6 7-6 7h-5l6-7-3-3h-4v10z" fill="#6df5d1" /></svg>;
}

export function AdSlot({ kind = "banner", className = "" }: { kind?: "banner" | "rail" | "mobile"; className?: string }) {
  if (!HOUSE_AD) return null;
  const ad = HOUSE_AD;
  return (
    <aside className={`ad-placeholder ad-${kind} house-ad ${className}`.trim()} data-ad-slot={kind} aria-label="광고">
      <a href={ad.href} target="_blank" rel="noopener">
        <span className="house-ad-badge">AD · {ad.label}</span>
        <RushMark />
        <span className="house-ad-copy">
          <strong>{ad.title}</strong>
          <small>{ad.subtitle}</small>
          {kind !== "mobile" && <span>{ad.description}</span>}
          {kind === "rail" && <ul>{ad.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>}
        </span>
        <span className="house-ad-cta">{ad.cta} →</span>
      </a>
    </aside>
  );
}
