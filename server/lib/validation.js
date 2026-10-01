import mongoose from "mongoose";
import { CATEGORY_LIST } from "../models/Listing.js";

export const isObjectId = (value) => mongoose.isValidObjectId(value);

const stringField = (value, name, maxLength, { optional = false } = {}) => {
  if (optional && value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new Error(`${name} must be a non-empty string of at most ${maxLength} characters`);
  }
  return value.trim();
};

const stringArray = (value, name, maxItems, maxLength) => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > maxItems ||
      value.some((item) => typeof item !== "string" || !item.trim() || item.trim().length > maxLength)) {
    throw new Error(`${name} must be an array of up to ${maxItems} non-empty strings`);
  }
  return value.map((item) => item.trim());
};

export function validatePlace(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("A place object is required");
  const name = stringField(input.name, "name", 160);
  const category = stringField(input.category, "category", 40);
  if (!CATEGORY_LIST.includes(category)) throw new Error("category is not supported");
  const price = input.price;
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > 999) {
    throw new Error("price must be a number between 0 and 999");
  }
  const city = stringField(input.city, "city", 100);
  const locality = stringField(input.locality, "locality", 120);
  const description = stringField(input.description, "description", 3000);
  const coordinates = input.coordinates;
  if (!coordinates || typeof coordinates !== "object") throw new Error("coordinates are required");
  const { lat, lng } = coordinates;
  if (typeof lat !== "number" || !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      typeof lng !== "number" || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error("coordinates must contain valid latitude and longitude values");
  }
  const photos = stringArray(input.photos, "photos", 12, 2048);
  if (photos.some((url) => !/^https?:\/\/\S+$/i.test(url))) throw new Error("photos must contain valid http(s) URLs");
  const photoCredits = input.photoCredits === undefined ? [] : input.photoCredits;
  if (!Array.isArray(photoCredits) || photoCredits.length > 12 || photoCredits.some((credit) =>
    !credit || typeof credit !== "object" ||
    typeof credit.author !== "string" || credit.author.length > 200 ||
    typeof credit.license !== "string" || credit.license.length > 80 ||
    typeof credit.sourceUrl !== "string" || !/^https?:\/\/\S+$/i.test(credit.sourceUrl)
  )) {
    throw new Error("photoCredits must contain valid photo attribution details");
  }
  return {
    name, category, price, city, locality, description, photos, photoCredits,
    coordinates: { lat, lng },
    tags: stringArray(input.tags, "tags", 30, 50),
    thingsToKnow: stringArray(input.thingsToKnow, "thingsToKnow", 30, 500),
  };
}

export function validateUsername(value) {
  const username = stringField(value, "username", 30).toLowerCase();
  if (!/^[a-z0-9_]{3,30}$/.test(username)) throw new Error("username must be 3-30 letters, numbers or underscores");
  return username;
}
