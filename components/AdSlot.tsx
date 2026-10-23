"use client";

import { useEffect, useRef } from "react";
import { adSlotFor } from "@/lib/ads";

/**
 * Display-ad container. Inert unless ads are enabled, a client id is present, and the
 * placement has a real numeric unit id in NEXT_PUBLIC_ADSENSE_SLOTS — a placement name
 * is not an AdSense slot id.
 */
const ADS_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
const ADS_SLOTS = process.env.NEXT_PUBLIC_ADSENSE_SLOTS;

export function AdSlot({
  id,
  className = "",
  minHeight = 90,
}: {
  id: string;
  className?: string;
  minHeight?: number;
}) {
  const slot = adSlotFor(id, ADS_SLOTS);
  const enabled = ADS_ENABLED && Boolean(ADS_CLIENT) && Boolean(slot);
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    const ins = insRef.current;
    if (!enabled || !ins || pushedRef.current) return;
    if (ins.getAttribute("data-adsbygoogle-status") === "done") return;

    pushedRef.current = true;
    const w = window as typeof window & { adsbygoogle?: unknown[] };
    w.adsbygoogle = w.adsbygoogle || [];
    w.adsbygoogle.push({});
  }, [enabled, slot]);

  if (!enabled) return null;

  return (
    <aside
      aria-label="Advertisement"
      className={`mx-auto my-8 flex items-center justify-center ${className}`}
      style={{ minHeight }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={ADS_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
