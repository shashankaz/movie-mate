"use client";

import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { MediaTile } from "@/components/media-tile";
import type { MediaKind } from "@/hooks/use-media-call";
import type { MediaState, Participant } from "@/lib/types";

interface Props {
  selfId: string | null;
  selfName: string;
  participants: Participant[];
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  state: MediaState;
  busy: MediaKind | null;
  error: string | null;
  onToggle: (kind: MediaKind) => void;
  onStop: () => void;
}

export function MediaPanel({
  selfId,
  selfName,
  participants,
  localStream,
  remoteStreams,
  state,
  busy,
  error,
  onToggle,
  onStop,
}: Props) {
  const selfSharing = state.audio || state.video;
  const sharingPeers = participants.filter(
    (p) => p.id !== selfId && (p.media.audio || p.media.video),
  );
  const liveCount = sharingPeers.length + (selfSharing ? 1 : 0);

  const toggleClass = (on: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-full transition disabled:opacity-50 ${
      on
        ? "bg-violet-600 text-white hover:bg-violet-500"
        : "border border-zinc-700 bg-white/5 text-zinc-300 hover:bg-zinc-800"
    }`;

  return (
    <div className="shrink-0 border-b border-zinc-800 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
        <span className="font-medium tracking-wide uppercase">Camera &amp; mic</span>
        <span>{liveCount > 0 ? `${liveCount} live` : "Off"}</span>
      </div>

      {liveCount > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {selfSharing && (
            <MediaTile
              name={selfName}
              stream={localStream}
              audioOn={state.audio}
              videoOn={state.video}
              isSelf
            />
          )}
          {sharingPeers.map((p) => (
            <MediaTile
              key={p.id}
              name={p.name}
              stream={remoteStreams[p.id] ?? null}
              audioOn={p.media.audio}
              videoOn={p.media.video}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onToggle("audio")}
          disabled={busy !== null}
          className={toggleClass(state.audio)}
          aria-label={state.audio ? "Mute microphone" : "Unmute microphone"}
          title={state.audio ? "Mute microphone" : "Turn on microphone"}
        >
          {state.audio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => onToggle("video")}
          disabled={busy !== null}
          className={toggleClass(state.video)}
          aria-label={state.video ? "Turn off camera" : "Turn on camera"}
          title={state.video ? "Turn off camera" : "Turn on camera"}
        >
          {state.video ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </button>
        {selfSharing && (
          <button
            type="button"
            onClick={onStop}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            Stop
          </button>
        )}
        {!selfSharing && (
          <span className="ml-1 text-xs text-zinc-500">
            {busy ? "Starting…" : "Share your camera or mic"}
          </span>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
