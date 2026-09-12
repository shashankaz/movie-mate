import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from "./events.js";
import { registerRoomHandlers } from "./room.handlers.js";

export const createSocketServer = (httpServer: HttpServer) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
  >(httpServer, {
    cors: { origin: env.clientOrigin, methods: ["GET", "POST"] },
    pingInterval: 10_000,
    pingTimeout: 5_000,
  });

  io.on("connection", (socket) => {
    registerRoomHandlers(io, socket);
  });

  return io;
};
