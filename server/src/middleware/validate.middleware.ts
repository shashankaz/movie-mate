import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { parse } from "../utils/validate.js";

export const validateBody =
  <T extends z.ZodType>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    req.body = parse(schema, req.body ?? {});
    next();
  };

export const validateParams =
  <T extends z.ZodType>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    parse(schema, req.params);
    next();
  };
