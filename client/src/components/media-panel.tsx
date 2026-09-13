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
    `flex h-10 w-10 items-center justify-center rounded-full transition disabled:opacity-50 ${
      on
        ? "bg-violet-600 text-white hover:bg-violet-500"
        : "border border-zinc-700 bg-white/5 text-zinc-300 hover:bg-zinc-800"
    }`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {liveCount > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
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
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
              <Video className="h-5 w-5" />
            </span>
            <p className="text-sm text-zinc-300">No one is on camera yet</p>
            <p className="text-xs text-zinc-500">
              {busy ? "Starting…" : "Turn on your camera or mic to appear here."}
            </p>
          </div>
        )}
      </div>

      {error && <p className="px-4 pb-1 text-xs text-red-400">{error}</p>}

      <div className="flex shrink-0 items-center justify-center gap-3 border-t border-zinc-800 p-3">
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
            aria-label="Stop sharing"
            title="Stop sharing"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
