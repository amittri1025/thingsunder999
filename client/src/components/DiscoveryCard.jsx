import { FiStar } from "react-icons/fi";

export default function DiscoveryCard({ listing, isHovered, onHover, onSelect }) {
  const priceLabel = listing.price === 0 ? "Free" : `₹${listing.price}/person`;
  return (
    <article
      className={`discovery-card ${isHovered ? "discovery-card-hovered" : ""}`}
      onMouseEnter={() => onHover(listing._id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(listing._id)}
    >
      <div className="discovery-photo" style={{ backgroundImage: `url(${listing.photos?.[0]})` }}>
        <span className="discovery-badge">{listing.category}</span>
      </div>
      <div className="discovery-body">
        <h3>{listing.name.split(" — ")[0]}</h3>
        <p className="discovery-price">{priceLabel}</p>
        <p className="discovery-meta">
          {listing.locality} · {listing.rating} <FiStar aria-label="stars" />
        </p>
        <p className="discovery-tag">{listing.tags?.[0]}</p>
      </div>
    </article>
  );
}
