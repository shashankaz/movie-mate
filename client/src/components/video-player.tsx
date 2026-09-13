"use client";

import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Pause, Play, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { formatTime } from "@/lib/format";
import { expectedPosition, type PlaybackSnapshot } from "@/lib/types";

const DRIFT_TOLERANCE = 1;
const TICK_MS = 2000;

interface Callbacks {
  onPlay: (t: number) => void;
  onPause: (t: number) => void;
  onSeek: (t: number) => void;
  onTick: (t: number) => void;
}

interface Props extends Callbacks {
  src: string;
  isHost: boolean;
  playback: PlaybackSnapshot | null;
}

export default function VideoPlayer({
  src,
  isHost,
  playback,
  onPlay,
  onPause,
  onSeek,
  onTick,
}: Props) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const callbacks = useRef<Callbacks>({ onPlay, onPause, onSeek, onTick });

  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    callbacks.current = { onPlay, onPause, onSeek, onTick };
  }, [onPlay, onPause, onSeek, onTick]);

  const applyPlayback = (pb: PlaybackSnapshot) => {
    const el = playerRef.current;
    if (!el) return;

    const target = expectedPosition(pb);
    if (Math.abs(el.currentTime - target) > DRIFT_TOLERANCE) el.currentTime = target;

    if (pb.isPlaying && el.paused) {
      Promise.resolve(el.play()).catch(() => setBlocked(true));
    } else if (!pb.isPlaying && !el.paused) {
      el.pause();
    }
  };

  useEffect(() => {
    if (!ready || !playback) return;
    applyPlayback(playback);

    if (!playback.isPlaying) return;
    const check = setTimeout(() => {
      if (playerRef.current?.paused) setBlocked(true);
    }, 1500);
    return () => clearTimeout(check);
  }, [ready, playback]);

  useEffect(() => {
    if (!isHost || !isPlaying) return;
    const id = setInterval(() => {
      const el = playerRef.current;
      if (el && !el.paused) callbacks.current.onTick(el.currentTime);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isHost, isPlaying]);

  const el = () => playerRef.current;

  const handleUnblock = () => {
    const player = el();
    if (!player) return;
    Promise.resolve(player.play())
      .then(() => {
        setBlocked(false);
        if (playback) applyPlayback(playback);
      })
      .catch(() => setBlocked(true));
  };

  const togglePlay = () => {
    const player = el();
    if (!player) return;
    if (player.paused) void player.play();
    else player.pause();
  };

  const resync = () => {
    if (playback) applyPlayback(playback);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 lg:min-h-0">
      <div className="relative aspect-video w-full bg-black lg:min-h-0">
        <ReactPlayer
          ref={playerRef}
          src={src}
          controls={isHost}
          muted={muted}
          volume={volume}
          playsInline
          style={{ width: "100%", height: "100%" }}
          onLoadedMetadata={() => setReady(true)}
          onCanPlay={() => setReady(true)}
          onDurationChange={() => {
            setDuration(el()?.duration ?? 0);
            setReady(true);
          }}
          onTimeUpdate={() => setCurrentTime(el()?.currentTime ?? 0)}
          onPlay={() => {
            setIsPlaying(true);
            setBlocked(false);
            if (isHost) callbacks.current.onPlay(el()?.currentTime ?? 0);
          }}
          onPause={() => {
            setIsPlaying(false);
            if (isHost) callbacks.current.onPause(el()?.currentTime ?? 0);
          }}
          onSeeked={() => {
            if (isHost) callbacks.current.onSeek(el()?.currentTime ?? 0);
          }}
          onEnded={() => {
            setIsPlaying(false);
            if (isHost) callbacks.current.onPause(el()?.duration ?? 0);
          }}
        />

        {!isHost && (
          <div className="absolute inset-0 z-10" aria-hidden={!blocked}>
            {blocked && (
              <button
                type="button"
                onClick={handleUnblock}
                className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black/60 text-white backdrop-blur-sm"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-violet-900">
                  <Play className="ml-1 h-7 w-7" fill="currentColor" />
                </span>
                <span className="text-sm font-medium">Click to start watching</span>
              </button>
            )}
          </div>
        )}

        {!ready && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-zinc-300">
            Loading video…
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-zinc-800 px-3 py-2 text-sm text-zinc-200">
        {isHost ? (
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-500"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
            )}
          </button>
        ) : (
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isPlaying ? "bg-violet-500/15 text-violet-300" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isPlaying ? "bg-violet-400" : "bg-zinc-500"}`}
            />
            {isPlaying ? "Playing" : "Paused"}
          </span>
        )}

        <span className="text-zinc-500 tabular-nums">
          {formatTime(currentTime)}
          <span className="mx-1 text-zinc-700">/</span>
          {formatTime(duration)}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {!isHost && (
            <button
              type="button"
              onClick={resync}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              title="Re-sync with the host"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Resync
            </button>
          )}
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setMuted(false);
            }}
            className="h-1 w-20 cursor-pointer accent-violet-500"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
