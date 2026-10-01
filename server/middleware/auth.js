import crypto from "node:crypto";
import AuthSession from "../models/AuthSession.js";
import User from "../models/User.js";

export const USER_COOKIE = "thingsunder999_session";
export const ADMIN_COOKIE = "thingsunder999_admin";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const ADMIN_SESSION_TTL_MS = 4 * 60 * 60 * 1000;

export function readCookie(req, name) {
  const header = req.headers.cookie || "";
  for (const entry of header.split(";")) {
    const separator = entry.indexOf("=");
    if (separator < 0) continue;
    if (entry.slice(0, separator).trim() === name) {
      try {
        return decodeURIComponent(entry.slice(separator + 1).trim());
      } catch {
        return "";
      }
    }
  }
  return "";
}

export function cookieOptions(maxAge) {
  const production = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    path: "/",
    maxAge,
  };
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(type, userId, lifetime, res) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + lifetime);
  await AuthSession.create({ tokenHash: hashToken(token), type, user: userId, expiresAt });
  res.cookie(type === "admin" ? ADMIN_COOKIE : USER_COOKIE, token, cookieOptions(lifetime));
}

export async function deleteSession(req, type) {
  const cookieName = type === "admin" ? ADMIN_COOKIE : USER_COOKIE;
  const token = readCookie(req, cookieName);
  if (token) await AuthSession.deleteOne({ tokenHash: hashToken(token), type });
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function adminCredentialsConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 16);
}

export function verifyAdminCredentials(username, password) {
  const usernameMatches = safeEqual(username, process.env.ADMIN_USERNAME || "");
  const passwordMatches = safeEqual(password, process.env.ADMIN_PASSWORD || "");
  return adminCredentialsConfigured() && usernameMatches && passwordMatches;
}

async function authenticate(req, res, next, type) {
  try {
    const token = readCookie(req, type === "admin" ? ADMIN_COOKIE : USER_COOKIE);
    if (!token) return res.status(401).json({ error: "Authentication required" });
    const session = await AuthSession.findOne({
      tokenHash: hashToken(token),
      type,
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!session) return res.status(401).json({ error: "Session expired" });
    if (type === "admin") {
      if (!adminCredentialsConfigured()) return res.status(401).json({ error: "Admin authentication is not configured" });
      req.admin = true;
    } else {
      const user = await User.findById(session.user).select("_id username karma bookmarks blocked").lean();
      if (!user || user.blocked) return res.status(401).json({ error: "Account unavailable" });
      req.user = user;
    }
    req.authSession = session;
    next();
  } catch {
    res.status(500).json({ error: "Authentication could not be verified" });
  }
}

export function requireUser(req, res, next) {
  return authenticate(req, res, next, "user");
}

export function requireAdmin(req, res, next) {
  return authenticate(req, res, next, "admin");
}
