import mongoose from "mongoose";
import { CATEGORY_LIST } from "./Listing.js";

const submissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, enum: CATEGORY_LIST, required: true },
    price: { type: Number, required: true, min: 0, max: 999 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    locality: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    photos: { type: [String], default: [] },
    coordinates: {
      lat: { type: Number, required: true, min: -90, max: 90 },
      lng: { type: Number, required: true, min: -180, max: 180 },
    },
    tags: { type: [String], default: [] },
    thingsToKnow: { type: [String], default: [] },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    reviewedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);
