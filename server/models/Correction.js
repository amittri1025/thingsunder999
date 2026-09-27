import mongoose from "mongoose";

const correctionSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    field: { type: String, required: true },
    suggestedValue: { type: String, required: true },
    note: { type: String },
    status: { type: String, enum: ["open", "accepted", "rejected"], default: "open" },
  },
  { timestamps: true }
);

export default mongoose.model("Correction", correctionSchema);
