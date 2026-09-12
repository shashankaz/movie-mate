import { z } from "zod";

try {
  process.loadEnvFile();
} catch {}

const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const positiveInt = (fallback: number) =>
  z.preprocess(blankToUndefined, z.coerce.number().int().positive().default(fallback));

const envSchema = z.object({
  PORT: positiveInt(4000),
  CLIENT_ORIGIN: z.preprocess(
    blankToUndefined,
    z.url({ protocol: /^https?$/ }).default("http://localhost:3000"),
  ),
  EMPTY_ROOM_TTL_MS: positiveInt(5 * 60 * 1000),
  CHAT_HISTORY_LIMIT: positiveInt(200),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = {
  port: parsed.data.PORT,
  clientOrigin: parsed.data.CLIENT_ORIGIN,
  emptyRoomTtlMs: parsed.data.EMPTY_ROOM_TTL_MS,
  chatHistoryLimit: parsed.data.CHAT_HISTORY_LIMIT,
} as const;
