export interface Participant {
  id: string; // socket id
  name: string;
  joinedAt: number;
}

export interface PlaybackState {
  videoUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
}

export type ChatMessageKind = "user" | "system";

export interface ChatMessage {
  id: string;
  kind: ChatMessageKind;
  senderId: string | null;
  senderName: string;
  text: string;
  sentAt: number;
}

export interface Room {
  id: string;
  name: string;
  hostKey: string;
  hostId: string | null;
  createdAt: number;
  participants: Map<string, Participant>;
  playback: PlaybackState;
  messages: ChatMessage[];
}

export interface RoomSnapshot {
  id: string;
  name: string;
  hostId: string | null;
  participants: Participant[];
  playback: PlaybackState & { serverTime: number };
  messages: ChatMessage[];
}

export interface PlaybackUpdate {
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
  serverTime: number;
}
