"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { Participants } from "@/components/participants";
import type { Participant } from "@/lib/types";

interface Props {
  roomId: string;
  roomName: string;
  isHost: boolean;
  connected: boolean;
  participants: Participant[];
  hostId: string | null;
  selfId: string | null;
  onShare: () => void;
}

export function RoomHeader({
  roomId,
  roomName,
  isHost,
  connected,
  participants,
  hostId,
  selfId,
  onShare,
}: Props) {
  const [peopleOpen, setPeopleOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!peopleOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!popoverRef.current?.contains(e.target as Node)) setPeopleOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPeopleOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [peopleOpen]);

  return (
    <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-zinc-800 px-4 py-3 sm:px-6">
      <Logo withText={false} />

      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold text-zinc-50">{roomName}</h1>
        <p className="truncate font-mono text-xs text-zinc-600">{roomId}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {!connected && (
          <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs text-amber-300">
            Reconnecting…
          </span>
        )}
        {isHost && (
          <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-300">
            Host
          </span>
        )}

        <div ref={popoverRef} className="relative">
          <button
            type="button"
            onClick={() => setPeopleOpen((o) => !o)}
            aria-expanded={peopleOpen}
            aria-haspopup="dialog"
            aria-label={`${participants.length} watching`}
            title="Watching"
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
              peopleOpen
                ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            {participants.length}
          </button>

          {peopleOpen && (
            <div
              role="dialog"
              aria-label="Watching"
              className="absolute top-full right-0 z-30 mt-2 w-72 animate-dialog-in rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/60"
            >
              <Participants participants={participants} hostId={hostId} selfId={selfId} />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-500"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
      </div>
    </header>
  );
}
