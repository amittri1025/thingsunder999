import { Router } from "express";
import Listing, { CATEGORY_LIST } from "../models/Listing.js";
import Correction from "../models/Correction.js";

const router = Router();

// GET /api/listings?city=Delhi NCR&category=Food&minPrice=0&maxPrice=999&search=bowling
router.get("/", async (req, res) => {
  try {
    const { city, category, minPrice, maxPrice, search } = req.query;
    const query = { status: "published" };

    if (city) query.city = city;
    if (category && category !== "All") query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const listings = await Listing.find(query).sort({ rating: -1 }).lean();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cities", async (_req, res) => {
  const cities = await Listing.distinct("city");
  res.json(cities);
});

router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, status: "published" }).lean();
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(400).json({ error: "Invalid listing id" });
  }
});

// POST /api/listings/:id/corrections  (a "Submit Correction" action)
router.post("/:id/corrections", async (req, res) => {
  try {
    const { field, suggestedValue, note } = req.body;
    if (!field || !suggestedValue) {
      return res.status(400).json({ error: "field and suggestedValue are required" });
    }
    const correction = await Correction.create({
      listing: req.params.id,
      field,
      suggestedValue,
      note,
    });
    res.status(201).json(correction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/meta/categories", (_req, res) => res.json(CATEGORY_LIST));

export default router;
