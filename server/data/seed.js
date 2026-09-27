/**
 * Seed script — populates MongoDB with SAMPLE/PLACEHOLDER discoveries.
 *
 * IMPORTANT: These listings are demo data (generic names, approximate
 * coordinates jittered around each city centre, placeholder photos from
 * picsum.photos). They exist so the frontend has something real to render.
 * In production, this collection should be populated by the ingestion
 * pipeline described in README.md (discover -> extract -> normalize -> load),
 * not by this script.
 *
 * Run with: npm run seed   (inside /server, after setting MONGODB_URI)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import Listing from "../models/Listing.js";

dotenv.config();

const CITIES = [
  { name: "Delhi NCR", lat: 28.6139, lng: 77.209 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
];

// A handful of well-known-style locality names per city, used only to make
// the demo data feel geographically plausible.
const LOCALITIES = {
  "Delhi NCR": ["Rajouri Garden", "Hauz Khas Village", "Connaught Place", "Saket", "Cyber Hub Gurugram", "Lajpat Nagar"],
  Mumbai: ["Bandra West", "Lower Parel", "Andheri West", "Colaba", "Powai", "Juhu"],
  Bengaluru: ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "MG Road", "Jayanagar"],
  Hyderabad: ["Jubilee Hills", "Gachibowli", "Banjara Hills", "Hitech City", "Kondapur", "Secunderabad"],
  Chennai: ["Nungambakkam", "Besant Nagar", "T. Nagar", "Adyar", "Velachery", "Anna Nagar"],
  Kolkata: ["Park Street", "Salt Lake", "Ballygunge", "New Town", "Gariahat", "Camac Street"],
  Pune: ["Koregaon Park", "Baner", "Viman Nagar", "FC Road", "Kalyani Nagar", "Aundh"],
};

const TEMPLATES = [
  { category: "Food", name: "Street Food Trail", price: 249, tags: ["street food", "budget"], desc: "A curated hop across three local stalls known for chaat, rolls and a legendary dessert." },
  { category: "Food", name: "Rooftop Cafe Breakfast", price: 399, tags: ["cafe", "brunch"], desc: "Filter coffee and an all-day breakfast plate with a skyline view, best on a weekday morning." },
  { category: "Activities", name: "Bowling + Arcade", price: 450, tags: ["indoor", "groups"], desc: "Two games of bowling plus arcade tokens — great for groups of four or more." },
  { category: "Activities", name: "Pottery Workshop", price: 699, tags: ["hands-on", "creative"], desc: "A two-hour beginner pottery session on the wheel, glazed piece shipped to you later." },
  { category: "Places", name: "Heritage Walk", price: 199, tags: ["outdoor", "history"], desc: "A guided 90-minute walk through the old quarter with a local historian." },
  { category: "Places", name: "Rooftop Sunset Point", price: 0, tags: ["free", "view"], desc: "A quiet rooftop with unobstructed sunset views, no entry fee, small cover charge on food." },
  { category: "Shopping", name: "Independent Design Market", price: 0, tags: ["market", "local brands"], desc: "A weekend market of independent clothing, jewellery and home-decor sellers." },
  { category: "Date Ideas", name: "Candlelight Dinner Cafe", price: 899, tags: ["romantic", "dinner"], desc: "A tucked-away cafe with low lighting and a set two-course menu for couples." },
  { category: "Date Ideas", name: "Paint & Sip Evening", price: 799, tags: ["creative", "evening"], desc: "Guided canvas painting session with unlimited mocktails, finished art to take home." },
  { category: "Nightlife", name: "Live Music Lounge", price: 599, tags: ["music", "evening"], desc: "Cover charge for a live indie/jazz set, redeemable against food and drinks." },
  { category: "Weekend", name: "Day Trek + Breakfast", price: 599, tags: ["outdoor", "fitness"], desc: "An early-morning group trek to a nearby viewpoint with breakfast included." },
  { category: "Weekend", name: "Board Game Cafe Session", price: 299, tags: ["indoor", "groups"], desc: "Unlimited access to a 200+ board game library for two hours, snacks extra." },
];

function jitter(base, spread = 0.06) {
  return base + (Math.random() - 0.5) * spread;
}

function buildListings() {
  const docs = [];
  for (const city of CITIES) {
    const localities = LOCALITIES[city.name];
    TEMPLATES.forEach((t, i) => {
      const locality = localities[i % localities.length];
      docs.push({
        name: `${t.name} — ${locality}`,
        category: t.category,
        price: t.price,
        city: city.name,
        locality,
        description: t.desc,
        photos: [
          `https://picsum.photos/seed/${encodeURIComponent(city.name + t.name)}1/800/600`,
          `https://picsum.photos/seed/${encodeURIComponent(city.name + t.name)}2/800/600`,
          `https://picsum.photos/seed/${encodeURIComponent(city.name + t.name)}3/800/600`,
        ],
        rating: Math.round((3.6 + Math.random() * 1.3) * 10) / 10,
        reviewCount: Math.floor(20 + Math.random() * 300),
        coordinates: { lat: jitter(city.lat), lng: jitter(city.lng) },
        source: "seed:placeholder",
        tags: t.tags,
        thingsToKnow: [
          "Prices are approximate and may vary by day/time.",
          "Sample data — replace via the ingestion pipeline for production.",
        ],
        status: "published",
      });
    });
  }
  return docs;
}

async function run() {
  await connectDB();
  const docs = buildListings();
  await Listing.deleteMany({ source: "seed:placeholder" });
  await Listing.insertMany(docs);
  console.log(`[seed] inserted ${docs.length} placeholder listings across ${CITIES.length} cities`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
