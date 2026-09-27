import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, unique: true, maxlength: 100 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    ipAddress: { type: String, required: true, select: false },
    lastSeenAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

visitorSchema.index({ state: 1, city: 1 });

export default mongoose.model("Visitor", visitorSchema);
