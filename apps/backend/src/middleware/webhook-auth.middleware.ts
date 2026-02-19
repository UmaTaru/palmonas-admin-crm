import { Request, Response, NextFunction } from "express";

export function webhookAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.headers["x-webhook-key"];

  if (key !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({
      message: "Unauthorized webhook",
    });
  }

  next();
}
