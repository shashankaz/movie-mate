"use client";

import { useEffect, useRef } from "react";
import { MicOff } from "lucide-react";
import { initials } from "@/lib/format";

interface Props {
  name: string;
  stream: MediaStream | null;
  audioOn: boolean;
  videoOn: boolean;
  isSelf?: boolean;
}

export function MediaTile({ name, stream, audioOn, videoOn, isSelf = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.srcObject !== stream) el.srcObject = stream;
  }, [stream]);

  const connecting = !isSelf && !stream;

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-blue-950">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isSelf}
        className={`h-full w-full object-cover ${videoOn ? "" : "hidden"} ${isSelf ? "-scale-x-100" : ""}`}
      />

      {!videoOn && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
            {initials(name)}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-linear-to-t from-blue-950/80 to-transparent px-2 py-1.5 text-[11px] text-white">
        <span className="truncate font-medium">{isSelf ? "You" : name}</span>
        {connecting && <span className="text-blue-200">· connecting…</span>}
        {!audioOn && <MicOff className="ml-auto h-3.5 w-3.5 shrink-0 text-blue-200" />}
      </div>
    </div>
  );
}
