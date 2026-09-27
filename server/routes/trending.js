import { Router } from "express";
import { getTrendingListings } from "../services/trendingService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { city } = req.query;
    const trending = await getTrendingListings(city);
    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
