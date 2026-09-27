import Listing from "../models/Listing.js";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function withActivity(listing, period) {
  const views = period === "week" ? randomInt(500, 20000) : randomInt(50, 5000);
  const likes = period === "week" ? randomInt(20, 1500) : randomInt(2, 350);
  return { listing, views, likes, score: views + likes * 8 };
}

function rankByActivity(listings, period, limit) {
  return listings
    .map((listing) => withActivity(listing, period))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function getTrendingListings(city) {
  const query = { status: "published" };
  if (city) query.city = city;
  const listings = await Listing.find(query).lean();

  const peopleLooking = listings
    .map((listing) => ({ listing, viewersNow: randomInt(2, 48) }))
    .sort((a, b) => b.viewersNow - a.viewersNow)
    .slice(0, 5);

  return {
    today: rankByActivity(listings, "today", 5),
    week: rankByActivity(listings, "week", 5),
    peopleLooking,
  };
}
