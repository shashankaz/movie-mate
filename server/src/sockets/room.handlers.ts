import type { Server, Socket } from "socket.io";
import {
  chatSendSchema,
  joinRoomSchema,
  mediaStateSchema,
  playbackSchema,
  rtcSignalSchema,
  setVideoSchema,
} from "../schemas/index.js";
import { roomService } from "../services/room.service.js";
import { AppError } from "../utils/AppError.js";
import { parse } from "../utils/validate.js";
import type { Ack, ClientToServerEvents, ServerToClientEvents, SocketData } from "./events.js";

type IO = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

const fail = (err: unknown): Ack => ({
  ok: false,
  error: err instanceof AppError ? err.message : "Something went wrong",
});

const guard =
  <T extends unknown[]>(fn: (...args: T) => void) =>
  (...args: T) => {
    try {
      fn(...args);
    } catch (err) {
      const ack = args.find((a): a is (res: Ack) => void => typeof a === "function");
      if (!(err instanceof AppError)) console.error("[socket]", err);
      ack?.(fail(err));
    }
  };

export const registerRoomHandlers = (io: IO, socket: AppSocket): void => {
  const roomOf = (): string => {
    if (!socket.data.roomId) throw AppError.forbidden("Join a room first");
    return socket.data.roomId;
  };

  socket.on(
    "room:join",
    guard((payload, ack) => {
      if (socket.data.roomId) throw new AppError("Already in a room");

      const { roomId, name, hostKey } = parse(joinRoomSchema, payload);
      const { room, participant, becameHost } = roomService.join(roomId, socket.id, name, hostKey);

      socket.data.roomId = roomId;
      socket.data.name = name;
      void socket.join(roomId);

      socket.to(roomId).emit("participant:joined", participant);
      if (becameHost) io.to(roomId).emit("host:changed", { hostId: socket.id });

      const notice = roomService.addSystemMessage(room, `${name} joined`);
      io.to(roomId).emit("chat:message", notice);

      ack({ ok: true, data: { room: roomService.snapshot(room), selfId: socket.id } });
    }),
  );

  socket.on(
    "video:set",
    guard((payload, ack) => {
      const roomId = roomOf();
      const { url } = parse(setVideoSchema, payload);
      const room = roomService.setVideo(roomId, socket.id, url);
      const { playback } = roomService.snapshot(room);
      io.to(roomId).emit("video:changed", { url, playback });
      ack?.({ ok: true });
    }),
  );

  socket.on(
    "playback:play",
    guard((payload, ack) => {
      const roomId = roomOf();
      const { currentTime } = parse(playbackSchema, payload);
      const update = roomService.play(roomId, socket.id, currentTime);
      socket.to(roomId).emit("playback:update", update);
      ack?.({ ok: true });
    }),
  );

  socket.on(
    "playback:pause",
    guard((payload, ack) => {
      const roomId = roomOf();
      const { currentTime } = parse(playbackSchema, payload);
      const update = roomService.pause(roomId, socket.id, currentTime);
      socket.to(roomId).emit("playback:update", update);
      ack?.({ ok: true });
    }),
  );

  socket.on(
    "playback:seek",
    guard((payload, ack) => {
      const roomId = roomOf();
      const { currentTime } = parse(playbackSchema, payload);
      const update = roomService.seek(roomId, socket.id, currentTime);
      socket.to(roomId).emit("playback:update", update);
      ack?.({ ok: true });
    }),
  );

  socket.on(
    "playback:tick",
    guard((payload) => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      const { currentTime } = parse(playbackSchema, payload);
      const update = roomService.tick(roomId, socket.id, currentTime);
      if (update) socket.to(roomId).emit("playback:update", update);
    }),
  );

  socket.on(
    "chat:send",
    guard((payload, ack) => {
      const roomId = roomOf();
      const { text } = parse(chatSendSchema, payload);
      const message = roomService.addMessage(roomId, socket.id, text);
      io.to(roomId).emit("chat:message", message);
      ack?.({ ok: true });
    }),
  );

  socket.on(
    "rtc:signal",
    guard((payload) => {
      const roomId = roomOf();
      const { to, data } = parse(rtcSignalSchema, payload);
      if (to === socket.id || !roomService.isMember(roomId, to)) return;
      io.to(to).emit("rtc:signal", { from: socket.id, data });
    }),
  );

  socket.on(
    "media:state",
    guard((payload) => {
      const roomId = roomOf();
      const media = parse(mediaStateSchema, payload);
      roomService.setMediaState(roomId, socket.id, media);
      socket.to(roomId).emit("media:state", { id: socket.id, ...media });
    }),
  );

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const result = roomService.leave(roomId, socket.id);
    if (!result) return;

    const { room, participant, newHostId } = result;
    socket.to(roomId).emit("participant:left", { id: socket.id });
    if (newHostId !== null) socket.to(roomId).emit("host:changed", { hostId: newHostId });

    if (room.participants.size > 0) {
      const notice = roomService.addSystemMessage(room, `${participant.name} left`);
      socket.to(roomId).emit("chat:message", notice);
    }
  });
};
