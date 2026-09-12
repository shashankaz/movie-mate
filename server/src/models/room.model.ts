import type { Room } from "../types/index.js";
import { newHostKey, newRoomId } from "../utils/id.js";

class RoomRepository {
  private readonly rooms = new Map<string, Room>();

  create(name: string): Room {
    let id = newRoomId();
    while (this.rooms.has(id)) id = newRoomId();

    const room: Room = {
      id,
      name,
      hostKey: newHostKey(),
      hostId: null,
      createdAt: Date.now(),
      participants: new Map(),
      playback: {
        videoUrl: null,
        isPlaying: false,
        currentTime: 0,
        updatedAt: Date.now(),
      },
      messages: [],
    };

    this.rooms.set(id, room);
    return room;
  }

  findById(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  delete(id: string): boolean {
    return this.rooms.delete(id);
  }

  count(): number {
    return this.rooms.size;
  }
}

export const roomRepository = new RoomRepository();
