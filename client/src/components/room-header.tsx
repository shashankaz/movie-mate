"use client";

import { Share2, Users } from "lucide-react";
import { Logo } from "@/components/logo";

interface Props {
  roomId: string;
  roomName: string;
  isHost: boolean;
  connected: boolean;
  participantCount: number;
  onShare: () => void;
}

export function RoomHeader({
  roomId,
  roomName,
  isHost,
  connected,
  participantCount,
  onShare,
}: Props) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-zinc-800 px-4 py-3 sm:px-6">
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
        <span className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">
          <Users className="h-3.5 w-3.5" />
          {participantCount}
        </span>
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
