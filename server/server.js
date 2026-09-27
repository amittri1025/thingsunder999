import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import listingsRouter from "./routes/listings.js";
import reviewsRouter from "./routes/reviews.js";
import trendingRouter from "./routes/trending.js";
import authRouter from "./routes/auth.js";
import submissionsRouter from "./routes/submissions.js";
import adminRouter from "./routes/admin.js";
import visitorsRouter from "./routes/visitors.js";

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/listings", listingsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/trending", trendingRouter);
app.use("/api/auth", authRouter);
app.use("/api/submissions", submissionsRouter);
app.use("/api/admin", adminRouter);
app.use("/api", visitorsRouter);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("[server] failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
