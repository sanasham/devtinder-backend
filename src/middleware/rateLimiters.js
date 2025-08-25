// src/middleware/rateLimiters.js
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Normalized key: IPv4/IPv6-safe via ipKeyGenerator.
 * For auth routes, we also bind to email (if present) to slow brute force
 * without breaking IPv6 normalization.
 */
const emailAwareKey = (req) => {
  const ipKey = ipKeyGenerator(req); // ✅ handles IPv6 correctly
  const email = (req.body?.email || '').toLowerCase().trim();
  return email ? `${ipKey}:${email}` : ipKey;
};

// Global limiter: 100 requests / 15m per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req, res) => ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
});

// Login/Register: 5 attempts / 10m per (IP+email)
// (Use POST body.email; safe despite IPv6 due to ipKeyGenerator)
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req, res) => emailAwareKey(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login/register attempts. Try again later.' },
});

// Refresh token: 30 requests / 10m per IP
export const refreshLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  keyGenerator: (req, res) => ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
});
