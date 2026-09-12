import { z } from "zod";

export const nameSchema = z
  .string({ error: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(32, "Name must be 32 characters or fewer");

export const roomIdSchema = z.uuid({ error: "That doesn't look like a valid room id or link" });

export const videoUrlSchema = z
  .string({ error: "Video link is required" })
  .trim()
  .pipe(z.url({ protocol: /^https?$/, error: "Enter a valid http(s) video link" }));

export const chatTextSchema = z
  .string({ error: "Message is required" })
  .trim()
  .min(1, "Message cannot be empty")
  .max(500, "Message must be 500 characters or fewer");

export const createRoomResponseSchema = z.object({
  roomId: z.uuid(),
  hostKey: z.string().min(1),
});

export const roomInfoResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  participantCount: z.number(),
  hasVideo: z.boolean(),
});

export const uploadConfigResponseSchema = z.object({
  enabled: z.boolean(),
  maxBytes: z.number(),
  acceptedTypes: z.array(z.string()),
});

export const presignUploadResponseSchema = z.object({
  uploadUrl: z.url(),
  publicUrl: z.url(),
  key: z.string(),
  expiresIn: z.number(),
});

export type Validated<T> = { ok: true; data: T } | { ok: false; error: string };

export const validate = <T extends z.ZodType>(
  schema: T,
  value: unknown,
): Validated<z.output<T>> => {
  const result = schema.safeParse(value);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error.issues[0]?.message ?? "Invalid input" };
};
