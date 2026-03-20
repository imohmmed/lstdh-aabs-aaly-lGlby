import type { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const stores: Record<string, RateLimitStore> = {};

export function rateLimit(opts: { windowMs: number; max: number; name: string }) {
  if (!stores[opts.name]) stores[opts.name] = {};
  const store = stores[opts.name];

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const now = Date.now();

    if (!store[ip] || store[ip].resetAt < now) {
      store[ip] = { count: 1, resetAt: now + opts.windowMs };
      return next();
    }

    store[ip].count++;

    if (store[ip].count > opts.max) {
      const retryAfter = Math.ceil((store[ip].resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: "طلبات كثيرة جداً، حاول بعد قليل",
        retryAfter,
      });
    }

    next();
  };
}
