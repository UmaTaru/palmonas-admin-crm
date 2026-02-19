import rateLimit from "express-rate-limit";

// Global API limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 100 requests / minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});


// Auth limiter (login brute force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many login attempts.",
  },
});


// Webhook limiter
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
});
