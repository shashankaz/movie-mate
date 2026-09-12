import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./types";

export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4000";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const createSocket = (): AppSocket =>
  io(SERVER_URL, {
    autoConnect: false,
    transports: ["websocket"],
    reconnectionDelay: 500,
    reconnectionDelayMax: 4000,
  });
