import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment and try again.' }
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes before trying again.' }
});

export const chatTextLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    return req.cookies?.space_chat_session || ipKeyGenerator(req.ip);
  },
  message: { error: 'Chat rate limit reached. Please wait a minute.' }
});

export const chatVoiceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    return req.cookies?.space_chat_session || ipKeyGenerator(req.ip);
  },
  message: { error: 'Voice note rate limit reached (max 5 per minute). Please wait.' }
});
