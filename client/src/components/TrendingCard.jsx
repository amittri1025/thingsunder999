import { CATEGORY_EMOJIS } from "../constants";

export default function TrendingCard({
  item,
  isHovered,
  onHover,
  onSelect,
  lookingNow = false,
  isLoggedIn = false,
  isBookmarked = false,
  onBookmark,
}) {
  const { listing, views, likes, viewersNow } = item;
  const priceLabel = listing.price === 0 ? "Free" : `₹${listing.price}`;

  return (
    <article
      className={`trending-card ${isHovered ? "trending-card-hovered" : ""}`}
      onMouseEnter={() => onHover(listing._id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(listing._id)}
    >
      <div
        className="trending-photo"
        style={{ backgroundImage: `url(${listing.photos?.[0]})` }}
        role="img"
        aria-label={listing.name}
      />
      <div className="trending-card-content">
        <div className="trending-card-topline">
          <span className="trending-category">{CATEGORY_EMOJIS[listing.category] || "📍"} {listing.category}</span>
          <span className="trending-price">{priceLabel}</span>
        </div>
        <h3>{listing.name.split(" — ")[0]}</h3>
        <p className="trending-location">{listing.locality} · {listing.rating}★</p>
        <div className="trending-card-metrics">
          {lookingNow ? (
            <span className="viewing-count">
              <span className="live-dot" /> {viewersNow} looking now
            </span>
          ) : (
            <>
              <span>◉ {views?.toLocaleString() ?? listing.reviewCount} views</span>
              <span>♥ {likes?.toLocaleString() ?? listing.reviewCount}</span>
            </>
          )}
          {listing.tags?.[0] && <span className="trending-tag">{listing.tags[0]}</span>}
        </div>
      </div>
      <button
        className={`bookmark-button ${isBookmarked ? "bookmark-active" : ""}`}
        type="button"
        aria-label={isBookmarked ? "Remove bookmark" : "Save bookmark"}
        title={isLoggedIn ? (isBookmarked ? "Remove bookmark" : "Save place") : "Log in to save"}
        onClick={(event) => {
          event.stopPropagation();
          onBookmark(listing._id);
        }}
      >
        {isBookmarked ? "💖" : "🤍"}
      </button>
    </article>
  );
}
