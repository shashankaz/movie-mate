"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Film } from "lucide-react";
import { Chat } from "@/components/chat";
import { MediaPanel } from "@/components/media-panel";
import { Participants } from "@/components/participants";
import { RoomHeader } from "@/components/room-header";
import { ShareDialog } from "@/components/share-dialog";
import { VideoUrlForm } from "@/components/video-url-form";
import { useMediaCall } from "@/hooks/use-media-call";
import { useRoom } from "@/hooks/use-room";

const VideoPlayer = dynamic(() => import("@/components/video-player"), { ssr: false });

interface Props {
  roomId: string;
  name: string;
  hostKey: string | null;
}

export function RoomView({ roomId, name, hostKey }: Props) {
  const room = useRoom(roomId, name, hostKey);
  const call = useMediaCall({
    socket: room.socket,
    selfId: room.selfId,
    participants: room.participants,
    onSignal: room.actions.signal,
    onStateChange: room.actions.setMediaState,
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);

  if (room.status === "joined" && room.isHost && !autoOpened) {
    setAutoOpened(true);
    setShareOpen(true);
  }

  if (room.status === "error") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-zinc-50">{room.error}</p>
        <Link href="/" className="text-sm text-violet-400 underline-offset-4 hover:underline">
          Back to home
        </Link>
      </main>
    );
  }

  if (room.status === "connecting") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-sm text-zinc-500">Joining room…</p>
        {room.error && <p className="text-xs text-amber-300">{room.error}</p>}
      </main>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <RoomHeader
        roomId={roomId}
        roomName={room.roomName}
        isHost={room.isHost}
        connected={room.connected}
        participantCount={room.participants.length}
        onShare={() => setShareOpen(true)}
      />

      <ShareDialog
        open={shareOpen}
        roomId={roomId}
        roomName={room.roomName}
        onClose={() => setShareOpen(false)}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6 lg:flex-row lg:overflow-hidden">
        <section className="flex min-w-0 shrink-0 flex-col gap-4 lg:min-h-0 lg:flex-1">
          {room.isHost && (
            <VideoUrlForm currentUrl={room.videoUrl} onSubmit={room.actions.setVideo} />
          )}

          {room.videoUrl ? (
            <VideoPlayer
              key={room.videoUrl}
              src={room.videoUrl}
              isHost={room.isHost}
              playback={room.playback}
              onPlay={room.actions.play}
              onPause={room.actions.pause}
              onSeek={room.actions.seek}
              onTick={room.actions.tick}
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/60 text-center lg:min-h-0">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
                <Film className="h-5 w-5" />
              </span>
              <p className="text-sm text-zinc-200">
                {room.isHost
                  ? "Paste a video link above to get started"
                  : "Waiting for the host to pick a video"}
              </p>
            </div>
          )}

          {!room.isHost && (
            <p className="text-xs text-zinc-500">
              Playback is controlled by the host. You&apos;ll stay in sync automatically.
            </p>
          )}
        </section>

        <aside className="flex min-h-80 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 lg:min-h-0 lg:w-80 lg:flex-none">
          <Participants
            participants={room.participants}
            hostId={room.hostId}
            selfId={room.selfId}
          />
          <MediaPanel
            selfId={room.selfId}
            selfName={name}
            participants={room.participants}
            localStream={call.localStream}
            remoteStreams={call.remoteStreams}
            state={call.state}
            busy={call.busy}
            error={call.error}
            onToggle={call.toggle}
            onStop={call.stopAll}
          />
          <Chat
            messages={room.messages}
            selfId={room.selfId}
            disabled={!room.connected}
            onSend={room.actions.sendMessage}
          />
        </aside>
      </div>
    </div>
  );
}
