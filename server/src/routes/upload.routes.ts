import { Router } from "express";
import { uploadController } from "../controllers/upload.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { presignUploadSchema } from "../schemas/index.js";

export const uploadRouter = Router();

uploadRouter.get("/config", uploadController.config);
uploadRouter.post("/presign", validateBody(presignUploadSchema), uploadController.presign);
