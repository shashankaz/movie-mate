"use client";

import Link from "next/link";
import { useState } from "react";
import { Link2 } from "lucide-react";
import { validate, videoUrlSchema } from "@/lib/schemas";

interface Props {
  currentUrl: string | null;
  onSubmit: (url: string) => Promise<{ ok: boolean; error?: string }>;
}

export function VideoUrlForm({ currentUrl, onSubmit }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;

    const checked = validate(videoUrlSchema, url);
    if (!checked.ok) {
      setError(checked.error);
      return;
    }

    setBusy(true);
    setError(null);
    const res = await onSubmit(checked.data);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Could not load that link");
    else setUrl("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-1.5"
    >
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Link2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder={
              currentUrl
                ? "Paste a new video link to switch"
                : "Paste a YouTube, Vimeo or .mp4 link"
            }
            className="w-full rounded-xl border border-blue-200 bg-white py-2.5 pr-3 pl-9 text-sm text-blue-950 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!url.trim() || busy}
          className="shrink-0 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-40"
        >
          {currentUrl ? "Switch" : "Load"}
        </button>
      </div>
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        <p className="text-xs text-slate-500">
          Have a file instead?{" "}
          <Link
            href="/upload"
            target="_blank"
            className="font-medium text-blue-700 underline-offset-4 hover:underline"
          >
            Upload it
          </Link>{" "}
          and paste the link here.
        </p>
      )}
    </form>
  );
}
