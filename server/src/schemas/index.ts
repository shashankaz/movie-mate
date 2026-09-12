import { z } from "zod";

export const nameSchema = z
  .string({ error: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(32, "Name must be 32 characters or fewer");

export const roomIdSchema = z.uuid({ error: "Invalid room id" });

export const videoUrlSchema = z
  .string({ error: "Video link is required" })
  .trim()
  .pipe(z.url({ protocol: /^https?$/, error: "Enter a valid http(s) video link" }));

export const timeSchema = z.number({ error: "Invalid time" }).nonnegative("Invalid time");

export const chatTextSchema = z
  .string({ error: "Message is required" })
  .trim()
  .min(1, "Message cannot be empty")
  .max(500, "Message must be 500 characters or fewer");

export const createRoomBodySchema = z.object({
  name: nameSchema.default("Movie night"),
});
export type CreateRoomBody = z.infer<typeof createRoomBodySchema>;

export const roomParamsSchema = z.object({ roomId: roomIdSchema });

export const joinRoomSchema = z.object({
  roomId: roomIdSchema,
  name: nameSchema,
  hostKey: z.string().optional(),
});

export const setVideoSchema = z.object({ url: videoUrlSchema });

export const playbackSchema = z.object({ currentTime: timeSchema });

export const chatSendSchema = z.object({ text: chatTextSchema });
