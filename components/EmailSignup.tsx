"use client";

import { useState, type FormEvent } from "react";

type State = "idle" | "loading" | "success" | "error";

export function EmailSignup({
  title = "Get an email the day GTA 6 is downloadable",
  description = "One message when official pre-orders change or a real download goes live. No newsletter spam, unsubscribe any time.",
  context = "gta-6-download",
  id,
}: {
  title?: string;
  description?: string;
  context?: string;
  id?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, context }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (res.ok && data.ok) {
        setState("success");
        setMessage(data.message ?? "You are on the list. We will email you when a download exists.");
        setEmail("");
      } else {
        setState("error");
        setMessage(data.message ?? "That did not work. Please check the address and try again.");
      }
    } catch {
      setState("error");
      setMessage("Network problem — please try again in a moment.");
    }
  }

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1.5 text-sm leading-6 text-ink-300">{description}</p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row" id={id}>
        <label htmlFor={`${id ?? "notify"}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id ?? "notify"}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-ink-700 bg-ink-950 px-4 py-3 text-sm text-white placeholder:text-ink-500 focus:border-brand-400"
        />
        <button type="submit" disabled={state === "loading"} className="btn-primary shrink-0">
          {state === "loading" ? "Saving…" : "Notify me"}
        </button>
      </form>

      <p
        role="status"
        aria-live="polite"
        className={
          state === "success"
            ? "mt-3 text-sm font-medium text-palm-400"
            : state === "error"
              ? "mt-3 text-sm font-medium text-sunset-400"
              : "mt-3 text-xs text-ink-500"
        }
      >
        {message || "We never sell email addresses. Unsubscribe in one click."}
      </p>
    </div>
  );
}
