import { Router } from "express";
import Visitor from "../models/Visitor.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/visitors", async (req, res) => {
  const { visitorId, city, state } = req.body || {};
  if (typeof visitorId !== "string" || !/^[A-Za-z0-9_-]{8,100}$/.test(visitorId) ||
      typeof city !== "string" || !city.trim() || city.trim().length > 100 ||
      typeof state !== "string" || !state.trim() || state.trim().length > 100) {
    return res.status(400).json({ error: "visitorId, city and state are required and must be valid" });
  }
  const ipAddress = req.ip || req.socket.remoteAddress;
  if (!ipAddress) return res.status(400).json({ error: "Could not determine request address" });
  try {
    const update = { $set: { city: city.trim(), state: state.trim(), ipAddress, lastSeenAt: new Date() } };
    try {
      await Visitor.findOneAndUpdate(
        { visitorId },
        update,
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      if (err?.code !== 11000) throw err;
      await Visitor.updateOne({ visitorId }, update, { runValidators: true });
    }
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Could not record visitor" });
  }
});

router.get("/admin/visitors", requireAdmin, async (req, res) => {
  const query = {};
  if (typeof req.query.state === "string" && req.query.state.trim()) query.state = new RegExp(`^${req.query.state.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  if (typeof req.query.city === "string" && req.query.city.trim()) query.city = new RegExp(`^${req.query.city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  try {
    const visitors = await Visitor.find(query).select("+ipAddress").sort({ lastSeenAt: -1 }).limit(1000).lean();
    return res.json(visitors.map(({ visitorId, city, state, ipAddress, lastSeenAt }) => ({
      visitorId, city, state, ipAddress, lastSeenAt,
    })));
  } catch {
    return res.status(500).json({ error: "Could not load visitors" });
  }
});

export default router;
