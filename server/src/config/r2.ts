import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

let client: S3Client | null = null;

export const getR2Client = (): S3Client => {
  if (!env.uploads) throw new Error("R2 is not configured");

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.uploads.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.uploads.accessKeyId,
        secretAccessKey: env.uploads.secretAccessKey,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return client;
};
