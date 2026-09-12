import { Router } from "express";
import { roomController } from "../controllers/room.controller.js";
import { validateBody, validateParams } from "../middleware/validate.middleware.js";
import { createRoomBodySchema, roomParamsSchema } from "../schemas/index.js";

export const roomRouter = Router();

roomRouter.post("/", validateBody(createRoomBodySchema), roomController.create);
roomRouter.get("/:roomId", validateParams(roomParamsSchema), roomController.getOne);
