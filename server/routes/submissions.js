import { Router } from "express";
import Submission from "../models/Submission.js";
import { requireUser } from "../middleware/auth.js";
import { validatePlace } from "../lib/validation.js";

const router = Router();

router.post("/", requireUser, async (req, res) => {
  try {
    const submission = await Submission.create({
      ...validatePlace(req.body),
      submittedBy: req.user._id,
      status: "pending",
    });
    return res.status(201).json(submission);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Invalid place submission" });
  }
});

export default router;
