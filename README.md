# ThingsUnder999

A map-first discovery app for finding food, activities, places and things to
do for ₹999 or less, across major Indian metros. Built on the MERN stack
(MongoDB, Express, React, Node) with Google Maps for the map layer.

This is the **basic working model**: a real, runnable full-stack app with
a seeded sample dataset, ready for you to swap in a real ingestion pipeline
and real listings.

## What's included

```
thingsunder999/
├── server/                Express + MongoDB API
│   ├── models/            Listing, Review, Correction schemas
│   ├── routes/            /api/listings, /api/reviews
│   ├── data/seed.js       Generates ~84 sample listings (12 per city × 7 cities)
│   └── server.js
└── client/                React + Vite frontend
    └── src/
        ├── components/    TopBar, FilterPanel, MapView, DiscoveryCard, DetailModal
        ├── App.jsx
        └── styles/index.css
```

## ⚠️ About the seed data

The listings created by `npm run seed` are **placeholder/demo data**, not
verified real venues: generic names, plausible-but-approximate coordinates
(jittered around each city centre), and stock placeholder photos from
picsum.photos. They exist purely so the app has something real to filter,
map, and click through. Before launch, replace this collection with data
from a real ingestion pipeline (see "Data layer / ingestion" below) or
hand-curated research per city.

## Getting started

### 1. Prerequisites
- Node.js 18+
- MongoDB configured as a replica set (MongoDB Atlas is ready for this; a
  local server must be started as a replica set). Review updates and community
  submission approval use transactions.

### 2. Backend

```bash
cd server
cp .env.example .env     # edit MONGODB_URI if using Atlas
npm install
npm run seed              # populates ~84 sample listings
npm run dev                # starts API on http://localhost:5000
```

To add 100 Delhi NCR testing places, run `npm run seed:delhi` from `server/`.
It uses approximate locality-level coordinates and stable seeded placeholder
photos from Picsum, then idempotently upserts only these test records without
deleting other listings. Names and locality descriptions are based on the
provided list; prices and venue details are illustrative and unverified.

### 3. Frontend

```bash
cd client
npm install
npm run dev                # starts React app on http://localhost:5173
```

Vite proxies `/api/*` to `http://localhost:5000`, so open
`http://localhost:5173` and the two talk to each other automatically.
Add a Google Maps JavaScript API key to `client/.env.local` as
`VITE_GOOGLE_MAPS_API_KEY=your-key`. Enable the Maps JavaScript API and billing
in Google Cloud, and restrict the key to your frontend domains.
Copy `client/.env.example` to `client/.env.local` for local environment setup.
When the API is served from the same origin, the client uses `/api` by default.
For a separately hosted frontend, set the client build variable
`VITE_API_BASE_URL` to the backend API base URL (for example,
`https://api.example.com/api`). Set the server's `CLIENT_ORIGIN` to the
frontend origin without a path (for example, `https://app.example.com`).
Because hosted frontend and backend use cross-site session cookies, set the
backend `NODE_ENV=production`; production cookies use `SameSite=None; Secure`.
User accounts must be registered before a user can log in, and admin access
requires `ADMIN_USERNAME` plus an `ADMIN_PASSWORD` of at least 16 characters.
Changing the admin credentials in the backend environment requires restarting
the server.
Copy `server/.env.example` to `server/.env` when setting up the backend.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/listings?city=&category=&minPrice=&maxPrice=&search=` | Filtered listings |
| GET | `/api/listings/cities` | Distinct list of cities with data |
| GET | `/api/listings/:id` | Single listing detail |
| POST | `/api/listings/:id/corrections` | Submit a correction (crowdsourced update queue) |
| GET | `/api/reviews/:listingId` | Reviews for a listing |
| POST | `/api/reviews/:listingId` | Add a review (recomputes the listing's average rating) |

### Accounts, community submissions and administration

The backend also provides cookie-session accounts for bookmarks and community
submissions. Passwords are stored as salted scrypt hashes; session tokens are
opaque, stored hashed in MongoDB, and expire automatically. Set these server
environment variables before using the corresponding features:

Usernames must be 3-30 letters, numbers, or underscores; user passwords must
be 10-128 characters. Configure `ADMIN_USERNAME` and a unique admin password
of at least 16 characters in `server/.env` before using `/admin`.

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string (defaults to local `thingsunder999`) |
| `CLIENT_ORIGIN` | Comma-separated allowed frontend origins; defaults to `http://localhost:5173` |
| `ADMIN_USERNAME` | Required configured admin login name (no default credentials) |
| `ADMIN_PASSWORD` | Required admin password of at least 16 characters; use a long unique secret |
| `NODE_ENV` | Set to `production` to enable the secure-only session cookie flag |

All account/admin routes use JSON and credentialed HTTP-only cookies. The
browser client must send requests with credentials enabled. User endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account and start a session (`{username,password}`) |
| POST | `/api/auth/login` | Start a user session |
| POST | `/api/auth/logout` | End the current user session |
| GET | `/api/auth/me` | Return the signed-in user directly (`{_id,username,karma,bookmarks}`) |
| POST / DELETE | `/api/auth/bookmarks/:listingId` | Save or remove a published listing bookmark |
| POST | `/api/submissions` | Submit a place for review and return the created submission directly; requires a user session |

Admin endpoints are protected by the configured admin session: `POST
/api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`, `GET|POST
/api/admin/listings`, `DELETE /api/admin/listings/:id`, `GET
/api/admin/submissions`, `PATCH /api/admin/submissions/:id` (status
`approved` or `rejected`), `GET /api/admin/users`,
`PATCH /api/admin/users/:id/block` (`{blocked:boolean}`), and
`GET /api/admin/visitors?state=&city=`. Approval publishes the submitted place
and awards its submitter one karma point; pending or rejected submissions do
not earn karma. Admins can also remove listings and block/unblock users.
Admins can flag or unflag a listing with `PATCH /api/admin/listings/:id/flag`
(`{flagged:boolean}`); flagged listings are hidden from public listing endpoints.

Visitor analytics are opt-in: the client should call `POST /api/visitors`
only after the visitor chooses to share their city/state, with
`{visitorId,city,state}`. The server captures the request IP; there is no GPS
or external geolocation lookup. Visitor IPs are returned only from the
authenticated admin analytics endpoint.

## Product loop implemented

Choose city → browse trending and local discoveries beside the map → save
favorites to a user account → open a listing for its detail panel, reviews,
and corrections. Signed-in users can submit new places; admins review them
before publication and award community karma.

- **Map**: Google Maps with a custom pink-and-gray style, randomized emoji
  markers, hover previews, and click-to-open listing details.
- **Filter panel**: category chips + ₹ price bands, combined via query
  params against the API.
- **Home feed**: scrollable discovery feed on the left and an equal-width,
  interactive map on the right. Trending and currently viewed lists are
  provided by the separate trending API.
- **Bookmarks**: users can register or log in, then save and remove places.
  Bookmarks and karma are stored in MongoDB.
- **Community submissions**: signed-in users can suggest a place from the
  bottom of the feed. Submissions stay pending until an admin approves them.
- **Admin dashboard**: visit `/admin` to manage places, review submissions,
  block accounts, flag spam listings, and filter opted-in visitor analytics.
- **Visitor analytics**: visitors can optionally share a self-selected
  city/state. The backend records the request IP only after consent; it does
  not request GPS coordinates or use an external geolocation service.
- **Detail panel**: slide-in panel (not full navigation) with photo
  gallery, tabs for About / Reviews / Submit Correction.

## Data layer / ingestion (next step, not built in this MVP)

The brief calls for an ingestion pipeline rather than hand-writing every
listing. The schema (`server/models/Listing.js`) is already shaped for this:
every listing has a `source` field and a `status` (`published` / `pending` /
`flagged`) so a pipeline can insert unreviewed candidates without them going
live immediately. A production pipeline would typically:

1. **Discover** candidate places per city/category (e.g. Google Places API,
   Zomato/Swiggy public listings, local blogs) — respecting each source's
   terms of use.
2. **Extract** price, locality, coordinates and a short description from
   each source.
3. **Normalize** into the `Listing` schema (consistent category names,
   price as a number, one canonical set of coordinates).
4. **De-duplicate** against existing listings (by name + locality + city).
5. **Load** as `status: "pending"`, then a human reviewer promotes to
   `status: "published"`.
6. **Crowdsourced upkeep**: the `Correction` model already captures
   user-submitted fixes ("Submit Correction" in the UI) for review.

## Notes on choices made for this MVP

- **Google Maps** via `@react-google-maps/api`; configure
  `VITE_GOOGLE_MAPS_API_KEY` in the client environment before running the map.
- **Vite** for the client build — faster dev server than CRA.
- Review submission recomputes the listing's `rating`/`reviewCount` in a
  MongoDB transaction so the two never drift out of sync.
