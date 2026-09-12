import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { getR2Client } from "../config/r2.js";
import type { PresignUploadBody } from "../schemas/index.js";
import { AppError } from "../utils/AppError.js";
import { newMessageId } from "../utils/id.js";

const UPLOAD_URL_TTL_SECONDS = 60 * 60;

const ACCEPTED_TYPES: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/x-m4v": ".m4v",
  "video/x-matroska": ".mkv",
  "video/ogg": ".ogv",
  "video/mpeg": ".mpeg",
  "video/x-msvideo": ".avi",
};

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

const extensionFor = (filename: string, contentType: string): string => {
  const fromName = /\.([a-z0-9]{1,5})$/i.exec(filename)?.[1]?.toLowerCase();
  return fromName ? `.${fromName}` : (ACCEPTED_TYPES[contentType] ?? "");
};

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

class UploadService {
  config() {
    const cfg = env.uploads;
    return {
      enabled: cfg !== null,
      maxBytes: cfg?.maxBytes ?? 0,
      acceptedTypes: Object.keys(ACCEPTED_TYPES),
    };
  }

  async presign({ filename, contentType, size }: PresignUploadBody): Promise<PresignedUpload> {
    const cfg = env.uploads;
    if (!cfg) throw new AppError("Uploads are not enabled on this server", 503, "UPLOADS_DISABLED");
    if (!(contentType in ACCEPTED_TYPES)) throw new AppError("That video format isn't supported");
    if (size > cfg.maxBytes) {
      throw new AppError(`File is too large (max ${formatBytes(cfg.maxBytes)})`);
    }

    const day = new Date().toISOString().slice(0, 10);
    const key = `videos/${day}/${newMessageId()}${extensionFor(filename, contentType)}`;

    const uploadUrl = await getSignedUrl(
      getR2Client(),
      new PutObjectCommand({ Bucket: cfg.bucket, Key: key, ContentType: contentType }),
      { expiresIn: UPLOAD_URL_TTL_SECONDS, signableHeaders: new Set(["content-type"]) },
    );

    return {
      uploadUrl,
      publicUrl: `${cfg.publicBaseUrl}/${key}`,
      key,
      expiresIn: UPLOAD_URL_TTL_SECONDS,
    };
  }
}

export const uploadService = new UploadService();
