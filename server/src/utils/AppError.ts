export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly code = "BAD_REQUEST",
  ) {
    super(message);
    this.name = "AppError";
  }

  static notFound(message = "Not found"): AppError {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(message, 403, "FORBIDDEN");
  }
}
