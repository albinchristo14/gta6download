export type AdSlots = Record<string, string>;

/** Keys JSON.parse can turn into prototype writes if copied onto a plain object. */
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * AdSense unit ids are numeric strings, and the placement names in the app are not. A
 * misconfigured map must render nothing rather than send "article-top" to Google as an id.
 */
export function parseAdSlots(raw: string | undefined): AdSlots {
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};

  const slots: AdSlots = {};
  for (const [id, value] of Object.entries(parsed)) {
    if (UNSAFE_KEYS.has(id) || typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) continue;
    slots[id] = trimmed;
  }
  return slots;
}

export function adSlotFor(id: string, raw: string | undefined): string | undefined {
  return parseAdSlots(raw)[id];
}
