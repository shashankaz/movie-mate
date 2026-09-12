import type { z } from "zod";
import { AppError } from "./AppError.js";

export const parse = <T extends z.ZodType>(schema: T, data: unknown): z.output<T> => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION");
  }

  return result.data;
};
