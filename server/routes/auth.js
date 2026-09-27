import { Router } from "express";
import crypto from "node:crypto";
import { promisify } from "node:util";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import {
  cookieOptions, createSession, deleteSession, hashToken, readCookie,
  requireUser, SESSION_TTL_MS, USER_COOKIE,
} from "../middleware/auth.js";
import AuthSession from "../models/AuthSession.js";
import { isObjectId, validateUsername } from "../lib/validation.js";

const scrypt = promisify(crypto.scrypt);
const router = Router();
const publicUser = (user) => ({
  _id: user._id,
  username: user.username,
  karma: user.karma,
  bookmarks: user.bookmarks || [],
});

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function passwordMatches(password, encoded) {
  try {
    const [saltHex, keyHex] = encoded.split(":");
    const expected = Buffer.from(keyHex, "hex");
    if (!saltHex || expected.length !== 64) return false;
    const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function passwordInput(value) {
  return typeof value === "string" && value.length >= 10 && value.length <= 128;
}

router.post("/register", async (req, res) => {
  try {
    const username = validateUsername(req.body?.username);
    const password = req.body?.password;
    if (!passwordInput(password)) return res.status(400).json({ error: "password must be 10-128 characters" });
    const user = await User.create({ username, passwordHash: await hashPassword(password) });
    await createSession("user", user._id, SESSION_TTL_MS, res);
    return res.status(201).json(publicUser(user));
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: "Username is already taken" });
    return res.status(400).json({ error: err.message || "Invalid registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const username = validateUsername(req.body?.username);
    const password = req.body?.password;
    if (typeof password !== "string" || password.length > 128) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const user = await User.findOne({ username }).select("+passwordHash");
    if (!user || user.blocked || !(await passwordMatches(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    await createSession("user", user._id, SESSION_TTL_MS, res);
    return res.json(publicUser(user));
  } catch (err) {
    return res.status(400).json({ error: err.message || "Invalid login" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    await deleteSession(req, "user");
    res.clearCookie(USER_COOKIE, cookieOptions(0));
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Could not log out" });
  }
});

router.get("/me", requireUser, (req, res) => res.json(publicUser(req.user)));

router.post("/bookmarks/:listingId", requireUser, async (req, res) => {
  try {
    if (!isObjectId(req.params.listingId)) return res.status(400).json({ error: "Invalid listing id" });
    const listing = await Listing.findOne({ _id: req.params.listingId, status: "published" }).select("_id");
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    await User.updateOne({ _id: req.user._id, blocked: false }, { $addToSet: { bookmarks: listing._id } });
    const user = await User.findById(req.user._id).select("_id username karma bookmarks").lean();
    return res.json(publicUser(user));
  } catch {
    return res.status(500).json({ error: "Could not save bookmark" });
  }
});

router.delete("/bookmarks/:listingId", requireUser, async (req, res) => {
  try {
    if (!isObjectId(req.params.listingId)) return res.status(400).json({ error: "Invalid listing id" });
    await User.updateOne({ _id: req.user._id }, { $pull: { bookmarks: req.params.listingId } });
    const user = await User.findById(req.user._id).select("_id username karma bookmarks").lean();
    return res.json(publicUser(user));
  } catch {
    return res.status(500).json({ error: "Could not remove bookmark" });
  }
});

export default router;
