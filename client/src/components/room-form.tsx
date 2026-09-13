"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { api } from "@/lib/api";
import { extractRoomCode } from "@/lib/format";
import { nameSchema, roomIdSchema, validate } from "@/lib/schemas";
import { session, useSavedName } from "@/lib/session";

type Mode = "create" | "join";

interface Props {
  mode: Mode;
}

const copy = {
  create: {
    title: "Create a room",
    subtitle: "You'll be the host. Share the link once you're in.",
    cta: "Create room",
    switchText: "Already have a link?",
    switchLabel: "Join a room",
    switchHref: "/join",
  },
  join: {
    title: "Join a room",
    subtitle: "Paste the link or room id your host shared.",
    cta: "Join room",
    switchText: "Want to host instead?",
    switchLabel: "Create a room",
    switchHref: "/create",
  },
} as const;

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/25 focus:outline-none";

export function RoomForm({ mode }: Props) {
  const router = useRouter();
  const savedName = useSavedName();
  const text = copy[mode];

  const [name, setName] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = name ?? savedName ?? "";

  const submit = async () => {
    if (busy) return;

    const who = validate(nameSchema, displayName);
    if (!who.ok) {
      setError(who.error);
      return;
    }

    setBusy(true);
    setError(null);
    session.setName(who.data);

    try {
      if (mode === "create") {
        const label = validate(nameSchema, roomName.trim() || `${who.data}'s room`);
        if (!label.ok) throw new Error(label.error);
        const { roomId, hostKey } = await api.createRoom(label.data);
        session.setHostKey(roomId, hostKey);
        router.push(`/room/${roomId}`);
      } else {
        const roomId = validate(roomIdSchema, extractRoomCode(code));
        if (!roomId.ok) throw new Error(roomId.error);
        await api.getRoom(roomId.data);
        router.push(`/room/${roomId.data}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  const canSubmit = !busy && displayName.trim() && (mode === "create" || code.trim());

  return (
    <main className="flex flex-1 flex-col px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <Logo />
      </div>

      <div className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">{text.title}</h1>
            <p className="mt-1 text-sm text-zinc-400">{text.subtitle}</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
          >
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-zinc-300">Your name</span>
              <input
                autoFocus
                value={displayName}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                maxLength={32}
                placeholder="e.g. Sam"
                className={inputClass}
              />
            </label>

            {mode === "create" ? (
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-zinc-300">Room name (optional)</span>
                <input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  maxLength={32}
                  placeholder="Friday movie night"
                  className={inputClass}
                />
              </label>
            ) : (
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-zinc-300">Room link or id</span>
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://…/room/<id>"
                  className={`${inputClass} font-mono`}
                />
              </label>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-40"
            >
              {busy ? "One moment…" : text.cta}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            {text.switchText}{" "}
            <Link
              href={text.switchHref}
              className="font-medium text-violet-400 underline-offset-4 hover:underline"
            >
              {text.switchLabel}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
