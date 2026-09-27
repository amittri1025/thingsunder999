const BASE = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function fetchListings({ city, category, minPrice, maxPrice, search }) {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (category && category !== "All") params.set("category", category);
  if (minPrice != null) params.set("minPrice", minPrice);
  if (maxPrice != null) params.set("maxPrice", maxPrice);
  if (search) params.set("search", search);

  return request(`/listings?${params.toString()}`);
}

export async function fetchCities() {
  return request("/listings/cities");
}

export async function fetchTrending(city) {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  return request(`/trending?${params.toString()}`);
}

export async function fetchListing(id) {
  return request(`/listings/${id}`);
}

export async function fetchReviews(listingId) {
  return request(`/reviews/${listingId}`);
}

export async function addReview(listingId, review) {
  return request(`/reviews/${listingId}`, {
    method: "POST",
    body: JSON.stringify(review),
  });
}

export async function submitCorrection(listingId, correction) {
  return request(`/listings/${listingId}/corrections`, {
    method: "POST",
    body: JSON.stringify(correction),
  });
}

export async function getCurrentUser() {
  return request("/auth/me");
}

export async function loginUser(credentials) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
}

export async function registerUser(credentials) {
  return request("/auth/register", { method: "POST", body: JSON.stringify(credentials) });
}

export async function logoutUser() {
  return request("/auth/logout", { method: "POST" });
}

export async function setBookmark(listingId, saved) {
  return request(`/auth/bookmarks/${listingId}`, { method: saved ? "DELETE" : "POST" });
}

export async function submitPlace(place) {
  return request("/submissions", { method: "POST", body: JSON.stringify(place) });
}

export async function recordVisitor(visitor) {
  return request("/visitors", { method: "POST", body: JSON.stringify(visitor) });
}

export async function adminLogin(credentials) {
  return request("/admin/login", { method: "POST", body: JSON.stringify(credentials) });
}

export async function adminLogout() {
  return request("/admin/logout", { method: "POST" });
}

export async function getAdminSession() {
  return request("/admin/me");
}

export async function getAdminData(path) {
  return request(`/admin/${path}`);
}

export async function adminAction(path, method, body) {
  return request(`/admin/${path}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
