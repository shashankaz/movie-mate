import type {
  ChatMessage,
  MediaState,
  Participant,
  PlaybackUpdate,
  RoomSnapshot,
  RtcSignalData,
} from "../types/index.js";

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
  "rtc:signal": (payload: { to: string; data: RtcSignalData }) => void;
  "media:state": (payload: MediaState) => void;
}

export interface ServerToClientEvents {
  "participant:joined": (participant: Participant) => void;
  "participant:left": (payload: { id: string }) => void;
  "host:changed": (payload: { hostId: string | null }) => void;
  "video:changed": (payload: { url: string; playback: PlaybackUpdate }) => void;
  "playback:update": (payload: PlaybackUpdate) => void;
  "chat:message": (message: ChatMessage) => void;
  "rtc:signal": (payload: { from: string; data: RtcSignalData }) => void;
  "media:state": (payload: { id: string } & MediaState) => void;
}

export interface SocketData {
  roomId?: string;
  name?: string;
}
