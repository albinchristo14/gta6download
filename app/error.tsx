"use client";

import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-page py-20 text-center sm:py-28">
      <div className="mx-auto max-w-xl">
        <p className="eyebrow">Server error</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-ink-950">
          Something broke on our side
        </h1>
        <p className="mt-4 text-pretty leading-7 text-ink-600">
          The page failed to render. Retrying usually fixes it — if it does not, the content itself
          is still available from the links below.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/gta-6-download" className="btn-secondary">
            Download status
          </Link>
          <Link href="/contact" className="btn-secondary">
            Report it
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-ink-400">
            Reference <code className="rounded bg-ink-100 px-1.5 py-0.5">{error.digest}</code> when
            reporting this so we can find it in the logs.
          </p>
        )}
      </div>
    </main>
  );
}
