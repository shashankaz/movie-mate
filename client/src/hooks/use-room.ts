"use client";

import { useEffect, useRef, useState } from "react";
import { createSocket, type AppSocket } from "@/lib/socket";
import type { Ack, ChatMessage, Participant, PlaybackSnapshot } from "@/lib/types";

export type RoomStatus = "connecting" | "joined" | "error";

export interface RoomState {
  status: RoomStatus;
  connected: boolean;
  error: string | null;
  selfId: string | null;
  roomName: string;
  hostId: string | null;
  participants: Participant[];
  messages: ChatMessage[];
  videoUrl: string | null;
  playback: PlaybackSnapshot | null;
}

const initialState: RoomState = {
  status: "connecting",
  connected: false,
  error: null,
  selfId: null,
  roomName: "",
  hostId: null,
  participants: [],
  messages: [],
  videoUrl: null,
  playback: null,
};

const MAX_MESSAGES = 200;

export const useRoom = (roomId: string, name: string, hostKey: string | null) => {
  const socketRef = useRef<AppSocket | null>(null);
  const [state, setState] = useState<RoomState>(initialState);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    const join = () => {
      socket.emit("room:join", { roomId, name, hostKey: hostKey ?? undefined }, (res) => {
        if (!res.ok || !res.data) {
          setState((s) => ({ ...s, status: "error", error: res.error ?? "Could not join room" }));
          socket.disconnect();
          return;
        }
        const { room, selfId } = res.data;
        const { videoUrl, ...playback } = room.playback;
        setState({
          status: "joined",
          connected: true,
          error: null,
          selfId,
          roomName: room.name,
          hostId: room.hostId,
          participants: room.participants,
          messages: room.messages,
          videoUrl,
          playback: { ...playback, receivedAt: Date.now() },
        });
      });
    };

    socket.on("connect", join);
    socket.on("disconnect", () => setState((s) => ({ ...s, connected: false })));
    socket.on("connect_error", () =>
      setState((s) =>
        s.status === "joined" ? s : { ...s, error: "Can't reach the server — retrying…" },
      ),
    );

    socket.on("participant:joined", (p) =>
      setState((s) => ({
        ...s,
        participants: [...s.participants.filter((x) => x.id !== p.id), p],
      })),
    );
    socket.on("participant:left", ({ id }) =>
      setState((s) => ({ ...s, participants: s.participants.filter((x) => x.id !== id) })),
    );
    socket.on("host:changed", ({ hostId }) => setState((s) => ({ ...s, hostId })));
    socket.on("video:changed", ({ url, playback }) =>
      setState((s) => ({ ...s, videoUrl: url, playback: { ...playback, receivedAt: Date.now() } })),
    );
    socket.on("playback:update", (playback) =>
      setState((s) => ({ ...s, playback: { ...playback, receivedAt: Date.now() } })),
    );
    socket.on("chat:message", (m) =>
      setState((s) => ({ ...s, messages: [...s.messages, m].slice(-MAX_MESSAGES) })),
    );

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, name, hostKey]);

  const withAck = async <T>(run: (socket: AppSocket) => Promise<Ack<T>>): Promise<Ack<T>> => {
    const socket = socketRef.current;
    if (!socket?.connected) return { ok: false, error: "Not connected" };
    try {
      return await run(socket);
    } catch {
      return { ok: false, error: "Request timed out" };
    }
  };

  const actions = {
    setVideo: (url: string) => withAck((s) => s.timeout(5000).emitWithAck("video:set", { url })),
    play: (currentTime: number) =>
      withAck((s) => s.timeout(5000).emitWithAck("playback:play", { currentTime })),
    pause: (currentTime: number) =>
      withAck((s) => s.timeout(5000).emitWithAck("playback:pause", { currentTime })),
    seek: (currentTime: number) =>
      withAck((s) => s.timeout(5000).emitWithAck("playback:seek", { currentTime })),
    tick: (currentTime: number) => {
      socketRef.current?.emit("playback:tick", { currentTime });
    },
    sendMessage: (text: string) =>
      withAck((s) => s.timeout(5000).emitWithAck("chat:send", { text })),
  };

  const isHost = state.selfId !== null && state.selfId === state.hostId;

  return { ...state, isHost, actions };
};
