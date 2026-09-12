import type { Request, Response } from "express";
import type { CreateRoomBody } from "../schemas/index.js";
import { roomService } from "../services/room.service.js";

export const roomController = {
  create(req: Request, res: Response): void {
    const { name } = req.body as CreateRoomBody;
    const { roomId, hostKey } = roomService.createRoom(name);
    res.status(201).json({ roomId, hostKey });
  },

  getOne(req: Request<{ roomId: string }>, res: Response): void {
    const room = roomService.getRoom(req.params.roomId);
    res.json({
      id: room.id,
      name: room.name,
      participantCount: room.participants.size,
      hasVideo: room.playback.videoUrl !== null,
    });
  },
};
