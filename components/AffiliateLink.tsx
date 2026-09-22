import type { AffiliateStore } from "@/affiliates.config";

export function AffiliateLink({
  store,
  children,
  className = "",
  variant = "primary",
}: {
  store: AffiliateStore;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const base = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <a
      href={store.url}
      rel="sponsored nofollow noopener"
      target="_blank"
      className={`${base} ${className}`}
    >
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

/**
 * A non-buyable store (e.g. Steam, while no PC version exists) must never render as a CTA.
 * This renders the honest explanation instead, with a plain link to the official storefront.
 */
export function StoreUnavailable({ store }: { store: AffiliateStore }) {
  return (
    <div className="rounded-lg border border-dashed border-ink-300 bg-ink-100 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-700">
        <span aria-hidden="true">✕</span>
        {store.name} — no legitimate GTA 6 listing
      </p>
      {store.note && <p className="mt-2 text-sm leading-6 text-ink-600">{store.note}</p>}
      <a
        href={store.url}
        rel="sponsored nofollow noopener"
        target="_blank"
        className="mt-3 inline-block text-sm font-medium text-brand-700 underline underline-offset-2"
      >
        Open {store.name} (official storefront)
      </a>
    </div>
  );
}
