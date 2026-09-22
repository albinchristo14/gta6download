export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-5 text-ink-500 ${className}`}>
      <strong className="font-semibold text-ink-600">Affiliate disclosure:</strong> some links on
      this page are affiliate links. If you buy through them we may earn a commission at no extra
      cost to you. We link only to official storefronts — we never host, link to, or distribute
      game files, and there is no legal free download of GTA 6.
    </p>
  );
}
