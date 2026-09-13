import { Crown, Mic, MicOff, Video } from "lucide-react";
import { initials } from "@/lib/format";
import type { Participant } from "@/lib/types";

interface Props {
  participants: Participant[];
  hostId: string | null;
  selfId: string | null;
}

const colors = [
  "bg-violet-500/25 text-zinc-200",
  "bg-violet-600 text-white",
  "bg-fuchsia-500/25 text-fuchsia-100",
  "bg-amber-500/15 text-amber-100",
  "bg-indigo-500/25 text-indigo-100",
  "bg-pink-500/25 text-pink-100",
];

const colorFor = (id: string) => {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
};

export function Participants({ participants, hostId, selfId }: Props) {
  const sorted = [...participants].sort((a, b) => a.joinedAt - b.joinedAt);

  return (
    <div className="flex max-h-96 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3 text-xs text-zinc-500">
        <span className="font-medium tracking-wide uppercase">Watching</span>
        <span>{participants.length}</span>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {sorted.map((p) => {
          const isHost = p.id === hostId;
          const isSelf = p.id === selfId;
          return (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-zinc-800/60"
              title={p.name}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${colorFor(p.id)}`}
              >
                {initials(p.name)}
              </span>
              <span className="min-w-0 flex-1 truncate text-zinc-50">
                {p.name}
                {isSelf && <span className="text-zinc-500"> (you)</span>}
              </span>
              {isHost && (
                <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-label="Host" />
              )}
              {p.media.video && (
                <Video className="h-3.5 w-3.5 shrink-0 text-violet-400" aria-label="Camera on" />
              )}
              {p.media.audio ? (
                <Mic className="h-3.5 w-3.5 shrink-0 text-violet-400" aria-label="Mic on" />
              ) : (
                <MicOff className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-label="Mic off" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
