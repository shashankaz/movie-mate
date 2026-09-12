import { env } from "../config/env.js";
import { roomRepository } from "../models/room.model.js";
import type {
  ChatMessage,
  Participant,
  PlaybackUpdate,
  Room,
  RoomSnapshot,
} from "../types/index.js";
import { AppError } from "../utils/AppError.js";
import { newMessageId } from "../utils/id.js";

const cleanupTimers = new Map<string, NodeJS.Timeout>();

class RoomService {
  createRoom(name: string): { roomId: string; hostKey: string } {
    const room = roomRepository.create(name);
    this.scheduleCleanup(room.id);
    return { roomId: room.id, hostKey: room.hostKey };
  }

  getRoom(roomId: string): Room {
    const room = roomRepository.findById(roomId);
    if (!room) throw AppError.notFound("Room not found");
    return room;
  }

  roomExists(roomId: string): boolean {
    return roomRepository.findById(roomId) !== undefined;
  }

  join(
    roomId: string,
    socketId: string,
    name: string,
    hostKey?: string,
  ): { room: Room; participant: Participant; becameHost: boolean } {
    const room = this.getRoom(roomId);
    this.cancelCleanup(roomId);

    const participant: Participant = { id: socketId, name, joinedAt: Date.now() };
    room.participants.set(socketId, participant);

    let becameHost = false;
    const claimsHost = hostKey !== undefined && hostKey === room.hostKey;
    if (claimsHost || room.hostId === null) {
      room.hostId = socketId;
      becameHost = true;
    }

    return { room, participant, becameHost };
  }

  leave(
    roomId: string,
    socketId: string,
  ): { room: Room; participant: Participant; newHostId: string | null } | null {
    const room = roomRepository.findById(roomId);
    if (!room) return null;

    const participant = room.participants.get(socketId);
    if (!participant) return null;
    room.participants.delete(socketId);

    let newHostId: string | null = null;
    if (room.hostId === socketId) {
      const next = [...room.participants.values()].sort((a, b) => a.joinedAt - b.joinedAt)[0];
      room.hostId = next?.id ?? null;
      newHostId = room.hostId;
    }

    if (room.participants.size === 0) {
      this.commitPlayback(room, false, this.currentPosition(room));
      this.scheduleCleanup(roomId);
    }

    return { room, participant, newHostId };
  }

  setVideo(roomId: string, socketId: string, url: string): Room {
    const room = this.requireHost(roomId, socketId);
    room.playback.videoUrl = url;
    this.commitPlayback(room, false, 0);
    return room;
  }

  play(roomId: string, socketId: string, currentTime: number): PlaybackUpdate {
    const room = this.requireHost(roomId, socketId);
    return this.commitPlayback(room, true, currentTime);
  }

  pause(roomId: string, socketId: string, currentTime: number): PlaybackUpdate {
    const room = this.requireHost(roomId, socketId);
    return this.commitPlayback(room, false, currentTime);
  }

  seek(roomId: string, socketId: string, currentTime: number): PlaybackUpdate {
    const room = this.requireHost(roomId, socketId);
    return this.commitPlayback(room, room.playback.isPlaying, currentTime);
  }

  tick(roomId: string, socketId: string, currentTime: number): PlaybackUpdate | null {
    const room = roomRepository.findById(roomId);
    if (!room || room.hostId !== socketId) return null;
    return this.commitPlayback(room, room.playback.isPlaying, currentTime);
  }

  addMessage(roomId: string, socketId: string, text: string): ChatMessage {
    const room = this.getRoom(roomId);
    const sender = room.participants.get(socketId);
    if (!sender) throw AppError.forbidden("You are not in this room");

    return this.pushMessage(room, {
      kind: "user",
      senderId: sender.id,
      senderName: sender.name,
      text,
    });
  }

  addSystemMessage(room: Room, text: string): ChatMessage {
    return this.pushMessage(room, { kind: "system", senderId: null, senderName: "System", text });
  }

  snapshot(room: Room): RoomSnapshot {
    const now = Date.now();
    return {
      id: room.id,
      name: room.name,
      hostId: room.hostId,
      participants: [...room.participants.values()],
      playback: {
        ...room.playback,
        currentTime: this.currentPosition(room, now),
        updatedAt: now,
        serverTime: now,
      },
      messages: room.messages,
    };
  }

  private requireHost(roomId: string, socketId: string): Room {
    const room = this.getRoom(roomId);
    if (room.hostId !== socketId) throw AppError.forbidden("Only the host can control playback");
    return room;
  }

  private currentPosition(room: Room, now = Date.now()): number {
    const { isPlaying, currentTime, updatedAt } = room.playback;
    if (!isPlaying) return currentTime;
    return currentTime + (now - updatedAt) / 1000;
  }

  private commitPlayback(room: Room, isPlaying: boolean, currentTime: number): PlaybackUpdate {
    const now = Date.now();
    room.playback.isPlaying = isPlaying;
    room.playback.currentTime = currentTime;
    room.playback.updatedAt = now;
    return { isPlaying, currentTime, updatedAt: now, serverTime: now };
  }

  private pushMessage(room: Room, data: Omit<ChatMessage, "id" | "sentAt">): ChatMessage {
    const message: ChatMessage = { ...data, id: newMessageId(), sentAt: Date.now() };
    room.messages.push(message);
    if (room.messages.length > env.chatHistoryLimit) {
      room.messages.splice(0, room.messages.length - env.chatHistoryLimit);
    }
    return message;
  }

  private scheduleCleanup(roomId: string): void {
    this.cancelCleanup(roomId);
    const timer = setTimeout(() => {
      const room = roomRepository.findById(roomId);
      if (room && room.participants.size === 0) roomRepository.delete(roomId);
      cleanupTimers.delete(roomId);
    }, env.emptyRoomTtlMs);
    timer.unref();
    cleanupTimers.set(roomId, timer);
  }

  private cancelCleanup(roomId: string): void {
    const timer = cleanupTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      cleanupTimers.delete(roomId);
    }
  }
}

export const roomService = new RoomService();
