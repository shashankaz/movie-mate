import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  console.error("[unhandled]", err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong" } });
};
