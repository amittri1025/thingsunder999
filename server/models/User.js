import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 30 },
    passwordHash: { type: String, required: true, select: false },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
    karma: { type: Number, default: 0, min: 0 },
    blocked: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
