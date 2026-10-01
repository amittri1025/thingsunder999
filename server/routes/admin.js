import { Router } from "express";
import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import AuthSession from "../models/AuthSession.js";
import {
  ADMIN_COOKIE, ADMIN_SESSION_TTL_MS, adminCredentialsConfigured, cookieOptions,
  createSession, deleteSession, requireAdmin, verifyAdminCredentials,
} from "../middleware/auth.js";
import { isObjectId, validatePlace } from "../lib/validation.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!adminCredentialsConfigured()) {
    return res.status(503).json({ error: "Admin login is unavailable until ADMIN_USERNAME and ADMIN_PASSWORD are configured" });
  }
  if (typeof username !== "string" || typeof password !== "string" ||
      !verifyAdminCredentials(username, password)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  try {
    await createSession("admin", undefined, ADMIN_SESSION_TTL_MS, res);
    return res.json({ username: process.env.ADMIN_USERNAME });
  } catch {
    return res.status(500).json({ error: "Could not create admin session" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    await deleteSession(req, "admin");
    res.clearCookie(ADMIN_COOKIE, cookieOptions(0));
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Could not log out" });
  }
});

router.get("/me", requireAdmin, (_req, res) => res.json({ username: process.env.ADMIN_USERNAME }));

router.get("/listings", requireAdmin, async (_req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 }).lean();
    return res.json(listings);
  } catch {
    return res.status(500).json({ error: "Could not load listings" });
  }
});

router.post("/listings", requireAdmin, async (req, res) => {
  try {
    const listing = await Listing.create({ ...validatePlace(req.body), status: "published", source: "admin" });
    return res.status(201).json({ listing });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Invalid listing" });
  }
});

router.patch("/listings/:id/flag", requireAdmin, async (req, res) => {
  const { flagged } = req.body || {};
  if (!isObjectId(req.params.id)) return res.status(400).json({ error: "Invalid listing id" });
  if (typeof flagged !== "boolean") return res.status(400).json({ error: "flagged must be a boolean" });
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: flagged ? "flagged" : "published" },
      { new: true, runValidators: true }
    ).lean();
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    return res.json({ listing });
  } catch {
    return res.status(500).json({ error: "Could not update listing" });
  }
});

router.delete("/listings/:id", requireAdmin, async (req, res) => {
  if (!isObjectId(req.params.id)) return res.status(400).json({ error: "Invalid listing id" });
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Could not delete listing" });
  }
});

router.get("/submissions", requireAdmin, async (_req, res) => {
  try {
    const submissions = await Submission.find({ status: "pending" })
      .populate("submittedBy", "username")
      .sort({ createdAt: -1 })
      .lean();
    return res.json(submissions);
  } catch {
    return res.status(500).json({ error: "Could not load submissions" });
  }
});

router.patch("/submissions/:id", requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!isObjectId(req.params.id)) return res.status(400).json({ error: "Invalid submission id" });
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "status must be approved or rejected" });
  let session;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      const submission = await Submission.findOneAndUpdate(
        { _id: req.params.id, status: "pending" },
        { $set: { status, reviewedAt: new Date() } },
        { new: true, session }
      );
      if (!submission) {
        const existing = await Submission.findById(req.params.id).session(session).lean();
        const error = new Error(existing ? "Submission has already been reviewed" : "Submission not found");
        error.statusCode = existing ? 409 : 404;
        throw error;
      }
      let listing;
      if (status === "approved") {
        [listing] = await Listing.create([{
          name: submission.name,
          category: submission.category,
          price: submission.price,
          city: submission.city,
          locality: submission.locality,
          description: submission.description,
          photos: submission.photos,
          photoCredits: submission.photoCredits,
          coordinates: submission.coordinates,
          tags: submission.tags,
          thingsToKnow: submission.thingsToKnow,
          source: "community",
          status: "published",
        }], { session });
        submission.listing = listing._id;
        await submission.save({ session });
        await User.updateOne({ _id: submission.submittedBy }, { $inc: { karma: 1 } }, { session });
      }
      result = { submission, listing: listing || null };
    });
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.statusCode ? err.message : "Could not review submission" });
  } finally {
    if (session) await session.endSession();
  }
});

router.get("/users", requireAdmin, async (_req, res) => {
  try {
    const users = await User.find().select("_id username karma bookmarks blocked createdAt").sort({ createdAt: -1 }).lean();
    return res.json(users);
  } catch {
    return res.status(500).json({ error: "Could not load users" });
  }
});

router.patch("/users/:id/block", requireAdmin, async (req, res) => {
  const { blocked } = req.body || {};
  if (!isObjectId(req.params.id)) return res.status(400).json({ error: "Invalid user id" });
  if (typeof blocked !== "boolean") return res.status(400).json({ error: "blocked must be a boolean" });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked }, {
      new: true,
      runValidators: true,
    }).select("_id username karma bookmarks blocked createdAt").lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    if (blocked) await AuthSession.deleteMany({ type: "user", user: user._id });
    return res.json({ user });
  } catch {
    return res.status(500).json({ error: "Could not update user" });
  }
});

export default router;
