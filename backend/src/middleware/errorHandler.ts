import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const statusCode = (err as any).statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      code: (err as any).code || "INTERNAL_ERROR",
      message: err.message || "An internal server error occurred",
    },
  });
}
