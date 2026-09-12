import type { Request, Response } from "express";
import type { PresignUploadBody } from "../schemas/index.js";
import { uploadService } from "../services/upload.service.js";

export const uploadController = {
  config(_req: Request, res: Response): void {
    res.json(uploadService.config());
  },

  async presign(req: Request, res: Response): Promise<void> {
    const upload = await uploadService.presign(req.body as PresignUploadBody);
    res.status(201).json(upload);
  },
};
