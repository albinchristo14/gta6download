/**
 * Display-ad container. Inert by default: renders nothing until an AdSense client id and
 * NEXT_PUBLIC_ADS_ENABLED="true" are set, so no placeholder ever reaches a live page.
 */
const ADS_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

export function AdSlot({
  id,
  className = "",
  minHeight = 90,
}: {
  id: string;
  className?: string;
  minHeight?: number;
}) {
  if (!ADS_ENABLED || !ADS_CLIENT) return null;

  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={id}
      className={`mx-auto my-8 flex items-center justify-center rounded-lg border border-dashed border-ink-200 bg-ink-100 text-xs text-ink-400 ${className}`}
      style={{ minHeight }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADS_CLIENT}
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
