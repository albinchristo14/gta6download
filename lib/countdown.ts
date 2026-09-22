export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalMs: number;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function timeUntil(target: string, now: Date = new Date()): TimeLeft {
  const targetMs = Date.parse(target);
  if (Number.isNaN(targetMs)) {
    throw new Error(`timeUntil: unparseable target date "${target}"`);
  }

  const diff = targetMs - now.getTime();
  const isPast = diff <= 0;
  const remaining = Math.abs(diff);

  return {
    days: Math.floor(remaining / DAY),
    hours: Math.floor((remaining % DAY) / HOUR),
    minutes: Math.floor((remaining % HOUR) / MINUTE),
    seconds: Math.floor((remaining % MINUTE) / SECOND),
    isPast,
    totalMs: diff,
  };
}

/** Human label for a day count, used where a live timer is unnecessary. */
export function relativeDays(days: number): string {
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return `about ${months} ${months === 1 ? "month" : "months"}`;
}
