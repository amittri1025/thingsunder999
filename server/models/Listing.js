import mongoose from "mongoose";

const CATEGORIES = [
  "Food",
  "Activities",
  "Places",
  "Shopping",
  "Date Ideas",
  "Nightlife",
  "Weekend",
];

const listingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    price: { type: Number, required: true, index: true },
    city: { type: String, required: true, index: true },
    locality: { type: String, required: true },
    description: { type: String, required: true },
    photos: { type: [String], default: [] },
    photoCredits: [{
      author: { type: String, default: "" },
      license: { type: String, default: "" },
      sourceUrl: { type: String, default: "" },
    }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    source: { type: String, default: "curated" },
    tags: { type: [String], default: [] },
    thingsToKnow: { type: [String], default: [] },
    status: { type: String, enum: ["published", "pending", "flagged"], default: "published" },
  },
  { timestamps: true }
);

listingSchema.index({ name: "text", description: "text", locality: "text" });

export const CATEGORY_LIST = CATEGORIES;
export default mongoose.model("Listing", listingSchema);
