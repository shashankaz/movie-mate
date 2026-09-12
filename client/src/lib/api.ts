import type { z } from "zod";
import {
  createRoomResponseSchema,
  presignUploadResponseSchema,
  roomInfoResponseSchema,
  uploadConfigResponseSchema,
} from "./schemas";
import { SERVER_URL } from "./socket";

interface ApiError {
  error?: { code: string; message: string };
}

const request = async <T extends z.ZodType>(
  path: string,
  schema: T,
  init?: RequestInit,
): Promise<z.output<T>> => {
  const res = await fetch(`${SERVER_URL}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(body.error?.message ?? `Request failed (${res.status})`);
  }
  const parsed = schema.safeParse(await res.json());
  if (!parsed.success) throw new Error("Unexpected response from server");
  return parsed.data;
};

export const api = {
  createRoom: (name: string) =>
    request("/rooms", createRoomResponseSchema, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getRoom: (roomId: string) =>
    request(`/rooms/${encodeURIComponent(roomId)}`, roomInfoResponseSchema),

  getUploadConfig: () => request("/uploads/config", uploadConfigResponseSchema),

  presignUpload: (body: { filename: string; contentType: string; size: number }) =>
    request("/uploads/presign", presignUploadResponseSchema, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
