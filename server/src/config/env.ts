import { z } from "zod";

try {
  process.loadEnvFile();
} catch {}

const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const positiveInt = (fallback: number) =>
  z.preprocess(blankToUndefined, z.coerce.number().int().positive().default(fallback));

const optionalString = z.preprocess(blankToUndefined, z.string().trim().min(1).optional());

const envSchema = z
  .object({
    PORT: positiveInt(4000),
    CLIENT_ORIGIN: z.preprocess(
      blankToUndefined,
      z.url({ protocol: /^https?$/ }).default("http://localhost:3000"),
    ),
    EMPTY_ROOM_TTL_MS: positiveInt(5 * 60 * 1000),
    CHAT_HISTORY_LIMIT: positiveInt(200),
    R2_ACCOUNT_ID: optionalString,
    R2_ACCESS_KEY_ID: optionalString,
    R2_SECRET_ACCESS_KEY: optionalString,
    R2_BUCKET: optionalString,
    R2_PUBLIC_BASE_URL: z.preprocess(blankToUndefined, z.url({ protocol: /^https?$/ }).optional()),
    UPLOAD_MAX_BYTES: positiveInt(5 * 1024 * 1024 * 1024),
  })
  .superRefine((data, ctx) => {
    const r2 = {
      R2_ACCOUNT_ID: data.R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID: data.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: data.R2_SECRET_ACCESS_KEY,
      R2_BUCKET: data.R2_BUCKET,
      R2_PUBLIC_BASE_URL: data.R2_PUBLIC_BASE_URL,
    };

    const set = Object.values(r2).filter(Boolean).length;

    if (set === 0 || set === Object.keys(r2).length) return;

    for (const [key, value] of Object.entries(r2)) {
      if (!value) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "Required when any R2_* variable is set",
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  process.exit(1);
}

const data = parsed.data;

const uploads =
  data.R2_ACCOUNT_ID &&
  data.R2_ACCESS_KEY_ID &&
  data.R2_SECRET_ACCESS_KEY &&
  data.R2_BUCKET &&
  data.R2_PUBLIC_BASE_URL
    ? {
        accountId: data.R2_ACCOUNT_ID,
        accessKeyId: data.R2_ACCESS_KEY_ID,
        secretAccessKey: data.R2_SECRET_ACCESS_KEY,
        bucket: data.R2_BUCKET,
        publicBaseUrl: data.R2_PUBLIC_BASE_URL.replace(/\/+$/, ""),
        maxBytes: data.UPLOAD_MAX_BYTES,
      }
    : null;

export const env = {
  port: data.PORT,
  clientOrigin: data.CLIENT_ORIGIN,
  emptyRoomTtlMs: data.EMPTY_ROOM_TTL_MS,
  chatHistoryLimit: data.CHAT_HISTORY_LIMIT,
  uploads,
} as const;
