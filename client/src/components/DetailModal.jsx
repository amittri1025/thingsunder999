import { useEffect, useState } from "react";
import { FiHeart, FiStar, FiX } from "react-icons/fi";
import { fetchListing, fetchReviews, addReview, submitCorrection } from "../api";

export default function DetailModal({ listingId, onClose, isBookmarked, onBookmark, isLoggedIn }) {
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ author: "", rating: 5, comment: "" });
  const [correctionForm, setCorrectionForm] = useState({ field: "price", suggestedValue: "", note: "" });
  const [activePhoto, setActivePhoto] = useState(0);
  const [tab, setTab] = useState("about"); // about | reviews | correction

  useEffect(() => {
    if (!listingId) return;
    fetchListing(listingId).then(setListing);
    fetchReviews(listingId).then(setReviews);
    setActivePhoto(0);
    setTab("about");
  }, [listingId]);

  if (!listingId || !listing) return null;

  async function handleReviewSubmit(e) {
    e.preventDefault();
    const created = await addReview(listingId, reviewForm);
    setReviews([created, ...reviews]);
    setReviewForm({ author: "", rating: 5, comment: "" });
  }

  async function handleCorrectionSubmit(e) {
    e.preventDefault();
    await submitCorrection(listingId, correctionForm);
    setCorrectionForm({ field: "price", suggestedValue: "", note: "" });
    setTab("about");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" type="button" aria-label="Close" onClick={onClose}><FiX aria-hidden="true" /></button>

        <div className="gallery">
          <img src={listing.photos[activePhoto]} alt={listing.name} className="gallery-main" />
          <div className="gallery-thumbs">
            {listing.photos.map((p, i) => (
              <img
                key={i}
                src={p}
                className={i === activePhoto ? "thumb-active" : ""}
                onClick={() => setActivePhoto(i)}
                alt=""
              />
            ))}
          </div>
        </div>

        <div className="modal-content">
          <div className="modal-title-row">
            <h2>{listing.name.split(" — ")[0]}</h2>
            <button
              className={`bookmark-button modal-bookmark ${isBookmarked ? "bookmark-active" : ""}`}
              onClick={() => onBookmark(listing._id)}
              title={isLoggedIn ? (isBookmarked ? "Remove bookmark" : "Save place") : "Log in to save"}
              aria-label={isBookmarked ? "Remove bookmark" : "Save bookmark"}
            >
              <FiHeart aria-hidden="true" />
            </button>
          </div>
          <p className="modal-meta">
            {listing.rating} <FiStar aria-label="stars" /> ({listing.reviewCount} reviews) · {listing.locality}, {listing.city}
          </p>
          <p className="modal-price">{listing.price === 0 ? "Free" : `₹${listing.price} / person`}</p>

          <div className="modal-tabs">
            <button className={tab === "about" ? "tab-active" : ""} onClick={() => setTab("about")}>About</button>
            <button className={tab === "reviews" ? "tab-active" : ""} onClick={() => setTab("reviews")}>
              Reviews ({reviews.length})
            </button>
            <button className={tab === "correction" ? "tab-active" : ""} onClick={() => setTab("correction")}>
              Submit Correction
            </button>
          </div>

          {tab === "about" && (
            <div className="tab-panel">
              <p>{listing.description}</p>
              <h4>Things to know</h4>
              <ul>
                {listing.thingsToKnow.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
              <p className="modal-source">Source: {listing.source}</p>
            </div>
          )}

          {tab === "reviews" && (
            <div className="tab-panel">
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <input
                  placeholder="Your name"
                  value={reviewForm.author}
                  onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                  required
                />
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                </select>
                <textarea
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                />
                <button type="submit">Add Review</button>
              </form>

              <div className="review-list">
                {reviews.map((r) => (
                  <div key={r._id} className="review-item">
                    <strong>{r.author}</strong> · {r.rating} <FiStar aria-label="stars" />
                    <p>{r.comment}</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="empty-state">No reviews yet — be the first.</p>}
              </div>
            </div>
          )}

          {tab === "correction" && (
            <form className="correction-form tab-panel" onSubmit={handleCorrectionSubmit}>
              <label>Field to correct</label>
              <select
                value={correctionForm.field}
                onChange={(e) => setCorrectionForm({ ...correctionForm, field: e.target.value })}
              >
                <option value="price">Price</option>
                <option value="locality">Locality</option>
                <option value="description">Description</option>
                <option value="coordinates">Map location</option>
              </select>
              <label>Suggested value</label>
              <input
                value={correctionForm.suggestedValue}
                onChange={(e) => setCorrectionForm({ ...correctionForm, suggestedValue: e.target.value })}
                required
              />
              <label>Note (optional)</label>
              <textarea
                value={correctionForm.note}
                onChange={(e) => setCorrectionForm({ ...correctionForm, note: e.target.value })}
              />
              <button type="submit">Submit Correction</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
