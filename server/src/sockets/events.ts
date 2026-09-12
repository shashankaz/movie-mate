import type { ChatMessage, Participant, PlaybackUpdate, RoomSnapshot } from "../types/index.js";

export interface Ack<T = undefined> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ClientToServerEvents {
  "room:join": (
    payload: { roomId: string; name: string; hostKey?: string },
    ack: (res: Ack<{ room: RoomSnapshot; selfId: string }>) => void,
  ) => void;
  "video:set": (payload: { url: string }, ack?: (res: Ack) => void) => void;
  "playback:play": (payload: { currentTime: number }, ack?: (res: Ack) => void) => void;
  "playback:pause": (payload: { currentTime: number }, ack?: (res: Ack) => void) => void;
  "playback:seek": (payload: { currentTime: number }, ack?: (res: Ack) => void) => void;
  "playback:tick": (payload: { currentTime: number }) => void;
  "chat:send": (payload: { text: string }, ack?: (res: Ack) => void) => void;
}

export interface ServerToClientEvents {
  "participant:joined": (participant: Participant) => void;
  "participant:left": (payload: { id: string }) => void;
  "host:changed": (payload: { hostId: string | null }) => void;
  "video:changed": (payload: { url: string; playback: PlaybackUpdate }) => void;
  "playback:update": (payload: PlaybackUpdate) => void;
  "chat:message": (message: ChatMessage) => void;
}

export interface SocketData {
  roomId?: string;
  name?: string;
}
