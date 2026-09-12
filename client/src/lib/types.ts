export interface Participant {
  id: string;
  name: string;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  kind: "user" | "system";
  senderId: string | null;
  senderName: string;
  text: string;
  sentAt: number;
}

export interface PlaybackUpdate {
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
  serverTime: number;
}

export interface PlaybackSnapshot extends PlaybackUpdate {
  receivedAt: number;
}

export interface RoomSnapshot {
  id: string;
  name: string;
  hostId: string | null;
  participants: Participant[];
  playback: PlaybackUpdate & { videoUrl: string | null };
  messages: ChatMessage[];
}

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
  "video:set": (payload: { url: string }, ack: (res: Ack) => void) => void;
  "playback:play": (payload: { currentTime: number }, ack: (res: Ack) => void) => void;
  "playback:pause": (payload: { currentTime: number }, ack: (res: Ack) => void) => void;
  "playback:seek": (payload: { currentTime: number }, ack: (res: Ack) => void) => void;
  "playback:tick": (payload: { currentTime: number }) => void;
  "chat:send": (payload: { text: string }, ack: (res: Ack) => void) => void;
}

export interface ServerToClientEvents {
  "participant:joined": (participant: Participant) => void;
  "participant:left": (payload: { id: string }) => void;
  "host:changed": (payload: { hostId: string | null }) => void;
  "video:changed": (payload: { url: string; playback: PlaybackUpdate }) => void;
  "playback:update": (payload: PlaybackUpdate) => void;
  "chat:message": (message: ChatMessage) => void;
}

export const expectedPosition = (pb: PlaybackSnapshot, now = Date.now()): number =>
  pb.isPlaying ? pb.currentTime + (now - pb.receivedAt) / 1000 : pb.currentTime;
