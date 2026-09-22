"use client";

import { useEffect, useState } from "react";
import { timeUntil, type TimeLeft } from "@/lib/countdown";

const UNITS: Array<{ key: keyof TimeLeft; label: string }> = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export function Countdown({
  target,
  onRelease = "GTA 6 is out",
}: {
  target: string;
  onRelease?: string;
}) {
  // Start from a fixed, server-rendered value so the countdown matches hydration.
  const [remaining, setRemaining] = useState<TimeLeft>(() => timeUntil(target, new Date()));

  useEffect(() => {
    const id = setInterval(() => setRemaining(timeUntil(target, new Date())), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining.isPast) {
    return (
      <p className="text-lg font-semibold text-palm-400" role="status">
        {onRelease}
      </p>
    );
  }

  return (
    <div>
      <p className="sr-only">
        GTA 6 releases in {remaining.days} days, {remaining.hours} hours.
      </p>
      <div aria-hidden="true" className="flex gap-2 sm:gap-3">
        {UNITS.map(({ key, label }) => (
          <div
            key={key}
            className="min-w-[4.25rem] rounded-lg border border-ink-700 bg-ink-900/80 px-2 py-3 text-center"
          >
            <div className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
              {String(remaining[key]).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-ink-400">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
