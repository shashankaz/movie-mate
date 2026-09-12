"use client";

import { useState } from "react";
import { Check, Link2, Users } from "lucide-react";
import { Logo } from "@/components/logo";

interface Props {
  roomId: string;
  roomName: string;
  isHost: boolean;
  connected: boolean;
  participantCount: number;
}

export function RoomHeader({ roomId, roomName, isHost, connected, participantCount }: Props) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-blue-100 px-4 py-3 sm:px-6">
      <Logo withText={false} />

      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold text-blue-950">{roomName}</h1>
        <p className="truncate font-mono text-xs text-slate-400">{roomId}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {!connected && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800">
            Reconnecting…
          </span>
        )}
        {isHost && (
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
            Host
          </span>
        )}
        <span className="flex items-center gap-1.5 rounded-full border border-blue-200 px-2.5 py-1 text-xs text-blue-800">
          <Users className="h-3.5 w-3.5" />
          {participantCount}
        </span>
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-800"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </header>
  );
}
