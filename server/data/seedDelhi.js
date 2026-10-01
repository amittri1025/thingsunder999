import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import Listing from "../models/Listing.js";
import { DELHI_PLACES } from "./delhiPlaces.js";

dotenv.config();

const SOURCE = "seed:delhi-testing-v1";
const LOCALITIES = [
  { match: /connaught|janpath|rajiv chowk|shankar market|bengali market|hailey road/i, coordinates: [28.6317, 77.2165] },
  { match: /lajpat|moolchand|amar colony/i, coordinates: [28.5677, 77.2433] },
  { match: /chandni chowk|old delhi|jama masjid|daryaganj|ballimaran|kashmere gate|khari baoli|dariba|kinari|naughara|karim|lal qila|red fort/i, coordinates: [28.6562, 77.2324] },
  { match: /mehrauli|qutub|qutb|chhatarpur|sanjay van|vasant kunj|saidul ajaib|saket|champa gali|aravalli|malviya nagar|bijay mandal/i, coordinates: [28.5245, 77.1855] },
  { match: /nizamuddin|sunder nursery|humayun/i, coordinates: [28.5892, 77.2507] },
  { match: /mathura road|delhi zoo|purana qila/i, coordinates: [28.603, 77.248] },
  { match: /delhi gate|bahadur shah zafar/i, coordinates: [28.635, 77.243] },
  { match: /mandi house|tansen marg/i, coordinates: [28.625, 77.234] },
  { match: /india gate|pandara|kartavya|central delhi|rashtrapati|raisina|pragati maidan|crafts museum/i, coordinates: [28.6129, 77.2295] },
  { match: /lodhi|jor bagh|habitat centre|bikaner house/i, coordinates: [28.5933, 77.219] },
  { match: /hauz khas|deer park|greater kailash|chittaranjan|cr park|east of kailash|kalkaji|nehru place|okhla|zakir nagar|shaheen bagh|faridabad/i, coordinates: [28.5494, 77.2001] },
  { match: /ina market|dilli haat|sarojini|south extension|safdarjung|green park|humayunpur|teen murti|chanakyapuri|air force museum|khan market|vasant vihar/i, coordinates: [28.5753, 77.209] },
  { match: /majnu|north delhi|university|northern ridge|roshanara|civil lines/i, coordinates: [28.7007, 77.2274] },
  { match: /akshardham|pandav nagar|yamuna|isbt|east delhi|sarai kale khan/i, coordinates: [28.623, 77.268] },
  { match: /karol bagh|paharganj|new delhi railway/i, coordinates: [28.644, 77.19] },
  { match: /rajouri|tilak nagar|west delhi/i, coordinates: [28.642, 77.12] },
  { match: /south extension|south delhi/i, coordinates: [28.567, 77.21] },
  { match: /gurugram|gurgaon|museo camera/i, coordinates: [28.4595, 77.0266] },
  { match: /noida/i, coordinates: [28.5355, 77.391] },
];

function hash(text) {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

function localityCoordinates(place) {
  const locality = `${place.locality} ${place.name}`;
  const match = LOCALITIES.find((area) => area.match.test(locality));
  if (!match) throw new Error(`No local test coordinate configured for "${place.name}" (${place.locality})`);

  const seed = hash(place.name);
  const latOffset = ((seed % 1001) / 1000 - 0.5) * 0.004;
  const lngOffset = (((seed >>> 10) % 1001) / 1000 - 0.5) * 0.004;
  return {
    lat: Number((match.coordinates[0] + latOffset).toFixed(6)),
    lng: Number((match.coordinates[1] + lngOffset).toFixed(6)),
  };
}

function buildOperation(place) {
  const photo = `https://picsum.photos/seed/${encodeURIComponent(place.name)}/800/600`;
  return {
    updateOne: {
      filter: { source: SOURCE, name: place.name, city: "Delhi NCR" },
      update: {
        $set: {
          name: place.name,
          category: place.category,
          price: place.price,
          city: "Delhi NCR",
          locality: place.locality,
          description: `${place.name} is a ${place.category.toLowerCase()} stop around ${place.locality}. This is testing content; confirm current hours, prices and venue details before a real visit.`,
          photos: [photo],
          coordinates: localityCoordinates(place),
          source: SOURCE,
          tags: [place.category.toLowerCase(), "Delhi", "test data"],
          thingsToKnow: [
            "Testing record: prices are illustrative estimates and venue details have not been independently verified.",
            "Map pin is placed approximately within the listed locality for testing.",
          ],
          status: "published",
        },
        $setOnInsert: { rating: 0, reviewCount: 0 },
      },
      upsert: true,
    },
  };
}

async function run() {
  if (DELHI_PLACES.length !== 100) {
    throw new Error(`Expected 100 Delhi test places, found ${DELHI_PLACES.length}`);
  }

  const operations = DELHI_PLACES.map(buildOperation);
  await connectDB();
  const result = await Listing.bulkWrite(operations, { ordered: true });
  const imported = await Listing.countDocuments({ source: SOURCE, city: "Delhi NCR" });
  console.log(`[seed:delhi] upserted ${result.upsertedCount}, refreshed ${result.modifiedCount}; ${imported} curated test records are available.`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("[seed:delhi] import failed:", error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
