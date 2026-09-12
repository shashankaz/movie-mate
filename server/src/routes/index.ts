import { Router } from "express";
import { roomRouter } from "./room.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

apiRouter.use("/rooms", roomRouter);
