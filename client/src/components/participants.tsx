import { Crown } from "lucide-react";
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
    <div className="border-b border-zinc-800 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
        <span className="font-medium tracking-wide uppercase">Watching</span>
        <span>{participants.length}</span>
      </div>
      <ul className="flex flex-wrap gap-2">
        {sorted.map((p) => {
          const isHost = p.id === hostId;
          const isSelf = p.id === selfId;
          return (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 py-1 pr-3 pl-1 text-xs"
              title={p.name}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${colorFor(p.id)}`}
              >
                {initials(p.name)}
              </span>
              <span className="max-w-36 truncate text-zinc-50">
                {p.name}
                {isSelf && <span className="text-zinc-600"> (you)</span>}
              </span>
              {isHost && <Crown className="h-3.5 w-3.5 text-amber-400" aria-label="Host" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
