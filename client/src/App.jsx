import { useEffect, useState } from "react";
import { FiEye, FiHeart, FiStar, FiTrendingUp } from "react-icons/fi";
import TopBar from "./components/TopBar";
import FilterPanel from "./components/FilterPanel";
import MapView from "./components/MapView";
import TrendingCard from "./components/TrendingCard";
import DetailModal from "./components/DetailModal";
import AuthDialog from "./components/AuthDialog";
import SubmitPlaceDialog from "./components/SubmitPlaceDialog";
import CommunityFooter from "./components/CommunityFooter";
import AdminPage from "./components/AdminPage";
import {
  fetchListings,
  fetchCities,
  fetchTrending,
  getCurrentUser,
  logoutUser,
  setBookmark,
} from "./api";

const DEFAULT_CENTER = [28.6139, 77.209];

function HomePage() {
  const [cities, setCities] = useState(["Delhi NCR"]);
  const [city, setCity] = useState("Delhi NCR");
  const [category, setCategory] = useState("All");
  const [priceBand, setPriceBand] = useState(null);
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState([]);
  const [trending, setTrending] = useState(null);
  const [trendingPeriod, setTrendingPeriod] = useState("today");
  const [trendingError, setTrendingError] = useState("");
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [openSubmissionAfterLogin, setOpenSubmissionAfterLogin] = useState(false);
  const [pendingBookmarkId, setPendingBookmarkId] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);

  useEffect(() => {
    fetchCities().then((availableCities) => {
      if (availableCities.length) setCities(availableCities);
    });
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((error) => {
        setUser(null);
        if (error.status !== 401) setActionError(error.message);
      });
  }, []);

  useEffect(() => {
    fetchListings({
      city,
      category,
      minPrice: priceBand?.min,
      maxPrice: priceBand?.max,
      search,
    }).then(setListings);
  }, [city, category, priceBand, search]);

  useEffect(() => {
    fetchTrending(city)
      .then((data) => {
        setTrending(data);
        setTrendingError("");
      })
      .catch((error) => setTrendingError(error.message));
  }, [city]);

  useEffect(() => {
    if (listings.length) {
      setCenter([listings[0].coordinates.lat, listings[0].coordinates.lng]);
    }
  }, [city]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setCenter([pos.coords.latitude, pos.coords.longitude]);
    });
  }

  async function handleBookmark(listingId) {
    setActionError("");
    if (!user) {
      setPendingBookmarkId(listingId);
      setShowAuth(true);
      return;
    }
    const bookmarks = user.bookmarks || [];
    const saved = bookmarks.some((bookmark) => String(bookmark) === listingId);
    try {
      await setBookmark(listingId, saved);
      setUser({
        ...user,
        bookmarks: saved
          ? bookmarks.filter((bookmark) => String(bookmark) !== listingId)
          : [...bookmarks, listingId],
      });
    } catch (error) {
      setActionError(error.message);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
      setUser(null);
      setNotice("You’re logged out. Your saved places will be here when you return.");
    } catch (error) {
      setActionError(error.message);
    }
  }

  function startSubmission() {
    setNotice("");
    if (!user) {
      setOpenSubmissionAfterLogin(true);
      setShowAuth(true);
      return;
    }
    setShowSubmission(true);
  }

  function handleAuthenticated(authenticatedUser) {
    setUser(authenticatedUser);
    if (pendingBookmarkId) {
      const listingId = pendingBookmarkId;
      setPendingBookmarkId(null);
      setBookmark(listingId, false)
        .then(() => {
          setUser((currentUser) => currentUser && ({
            ...currentUser,
            bookmarks: [...(currentUser.bookmarks || []), listingId],
          }));
        })
        .catch((error) => setActionError(error.message));
    }
    if (openSubmissionAfterLogin) {
      setOpenSubmissionAfterLogin(false);
      setShowSubmission(true);
    }
  }

  function closeAuth() {
    setShowAuth(false);
    setOpenSubmissionAfterLogin(false);
    setPendingBookmarkId(null);
  }

  function handlePlaceSubmitted() {
    setShowSubmission(false);
    setNotice("Place submitted for review! You’ll earn community karma when it’s approved.");
  }

  const trendingListings = trending?.[trendingPeriod] || [];
  const lookingListings = trending?.peopleLooking || [];
  const bookmarkedIds = new Set((user?.bookmarks || []).map(String));

  return (
    <div className="app-shell">
      <TopBar
        cities={cities}
        city={city}
        onCityChange={setCity}
        search={search}
        onSearchChange={setSearch}
        onLocate={handleLocate}
        user={user}
        onShowLogin={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <div className="app-body">
        <div className="home-layout">
          <aside className="feed-column">
            <div className="feed-heading">
              <p className="feed-eyebrow">Aap ka sheher, Aap tak <FiHeart aria-hidden="true" /></p>
              <h1> <span className="rotating-headline"> <span className="headline-track"> <span>aaj kaha ka plan hai ?</span> <span>date pe jana hai ?</span> <span>chale ghummi ghummi</span> {/* Duplicate first slide for seamless loop */} <span>aaj kaha ka plan hai ?</span> </span> </span> </h1>
              <p>Fresh ideas, local favorites, and main-character plans — all under ₹999. <FiStar aria-hidden="true" /></p>
            </div>

            <FilterPanel
              category={category}
              onCategoryChange={setCategory}
              priceBand={priceBand}
              onPriceBandChange={setPriceBand}
            />

            <section className="feed-section">
              <div className="feed-section-heading">
                <div>
                  <p className="feed-eyebrow">The local buzz</p>
                  <h2>Trending <FiTrendingUp aria-hidden="true" /></h2>
                </div>
                <div className="period-switch" aria-label="Trending time period">
                  <button
                    className={trendingPeriod === "today" ? "period-active" : ""}
                    aria-pressed={trendingPeriod === "today"}
                    onClick={() => setTrendingPeriod("today")}
                  >
                    Today
                  </button>
                  <button
                    className={trendingPeriod === "week" ? "period-active" : ""}
                    aria-pressed={trendingPeriod === "week"}
                    onClick={() => setTrendingPeriod("week")}
                  >
                    Last week
                  </button>
                </div>
              </div>

              {trendingError && <p className="feed-message">{trendingError}</p>}
              {!trending && !trendingError && <p className="feed-message">Finding the local favorites…</p>}
              {trendingListings.map((item) => (
                <TrendingCard
                  key={item.listing._id}
                  item={item}
                  isHovered={hoveredId === item.listing._id}
                  onHover={setHoveredId}
                  onSelect={setSelectedId}
                  isLoggedIn={Boolean(user)}
                  isBookmarked={bookmarkedIds.has(item.listing._id)}
                  onBookmark={handleBookmark}
                />
              ))}
              {trending && trendingListings.length === 0 && (
                <p className="feed-message">No trending discoveries for this city yet.</p>
              )}
            </section>

            <section className="feed-section people-looking">
              <div className="feed-section-heading">
                <div>
                  <p className="feed-eyebrow">Live interest</p>
                  <h2>People are looking at this <FiEye aria-hidden="true" /></h2>
                </div>
              </div>
              {lookingListings.map((item) => (
                <TrendingCard
                  key={item.listing._id}
                  item={item}
                  isHovered={hoveredId === item.listing._id}
                  onHover={setHoveredId}
                  onSelect={setSelectedId}
                  lookingNow
                  isLoggedIn={Boolean(user)}
                  isBookmarked={bookmarkedIds.has(item.listing._id)}
                  onBookmark={handleBookmark}
                />
              ))}
              {trending && lookingListings.length === 0 && (
                <p className="feed-message">No live activity to show just yet.</p>
              )}
            </section>

            <section className="feed-section all-discoveries">
              <div className="feed-section-heading">
                <div>
                  <p className="feed-eyebrow">Made for you</p>
                  <h2>All discoveries</h2>
                </div>
                <span>{listings.length} places</span>
              </div>
              {listings.map((listing) => (
                <TrendingCard
                  key={listing._id}
                  item={{ listing }}
                  isHovered={hoveredId === listing._id}
                  onHover={setHoveredId}
                  onSelect={setSelectedId}
                  isLoggedIn={Boolean(user)}
                  isBookmarked={bookmarkedIds.has(listing._id)}
                  onBookmark={handleBookmark}
                />
              ))}
              {listings.length === 0 && (
                <p className="feed-message">No discoveries match these filters yet.</p>
              )}
            </section>
            {actionError && <p className="form-error" role="alert">{actionError}</p>}
            {notice && <p className="community-notice" role="status">{notice}</p>}
            <CommunityFooter city={city} onSubmitPlace={startSubmission} />
          </aside>

          <main className="map-area">
            <MapView
              listings={listings}
              center={center}
              activeId={selectedId}
              hoveredId={hoveredId}
              onSelect={setSelectedId}
              onHover={setHoveredId}
            />
          </main>
        </div>
      </div>

      <DetailModal
        listingId={selectedId}
        onClose={() => setSelectedId(null)}
        isBookmarked={bookmarkedIds.has(selectedId)}
        onBookmark={handleBookmark}
        isLoggedIn={Boolean(user)}
      />
      {showAuth && <AuthDialog onClose={closeAuth} onAuthenticated={handleAuthenticated} />}
      {showSubmission && (
        <SubmitPlaceDialog
          cities={cities}
          defaultCity={city}
          onClose={() => setShowSubmission(false)}
          onSubmitted={handlePlaceSubmitted}
        />
      )}
    </div>
  );
}

export default function App() {
  return window.location.pathname.replace(/\/+$/, "") === "/admin" ? <AdminPage /> : <HomePage />;
}
