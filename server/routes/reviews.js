import { Router } from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Listing from "../models/Listing.js";

const router = Router();

router.get("/:listingId", async (req, res) => {
  const reviews = await Review.find({ listing: req.params.listingId }).sort({ createdAt: -1 }).lean();
  res.json(reviews);
});

router.post("/:listingId", async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { author, rating, comment } = req.body;
    if (!author || !rating || !comment) {
      return res.status(400).json({ error: "author, rating and comment are required" });
    }

    session.startTransaction();
    const [review] = await Review.create([{ listing: req.params.listingId, author, rating, comment }], { session });

    const stats = await Review.aggregate([
      { $match: { listing: new mongoose.Types.ObjectId(req.params.listingId) } },
      { $group: { _id: "$listing", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).session(session);

    if (stats.length) {
      await Listing.findByIdAndUpdate(
        req.params.listingId,
        { rating: Math.round(stats[0].avg * 10) / 10, reviewCount: stats[0].count },
        { session }
      );
    }

    await session.commitTransaction();
    res.status(201).json(review);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

export default router;
