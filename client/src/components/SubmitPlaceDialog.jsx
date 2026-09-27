import { useState } from "react";
import { CATEGORIES } from "../constants";
import { submitPlace } from "../api";

const EMPTY_FORM = {
  name: "",
  category: "Food",
  price: "",
  city: "",
  locality: "",
  description: "",
  photo: "",
  lat: "",
  lng: "",
  tags: "",
};

export default function SubmitPlaceDialog({ cities, defaultCity, onClose, onSubmitted }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, city: defaultCity || "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await submitPlace({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        city: form.city,
        locality: form.locality,
        description: form.description,
        photos: form.photo ? [form.photo] : [],
        coordinates: { lat: Number(form.lat), lng: Number(form.lng) },
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        thingsToKnow: [],
      });
      onSubmitted(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay auth-overlay" onClick={onClose}>
      <section className="place-submit-panel" role="dialog" aria-modal="true" aria-labelledby="submit-place-title" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        <p className="feed-eyebrow">Spread the good word 💖</p>
        <h2 id="submit-place-title">Found an interesting place?</h2>
        <p className="auth-intro">Submit it for review so everyone can enjoy it. Approved finds earn community karma!</p>
        <form className="place-submit-form" onSubmit={handleSubmit}>
          <label>Place name<input value={form.name} onChange={(e) => change("name", e.target.value)} required maxLength="120" /></label>
          <div className="form-row">
            <label>Category
              <select value={form.category} onChange={(e) => change("category", e.target.value)}>
                {CATEGORIES.filter((category) => category !== "All").map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>Price per person (₹)<input type="number" min="0" max="999" value={form.price} onChange={(e) => change("price", e.target.value)} required /></label>
          </div>
          <div className="form-row">
            <label>City
              <input list="submission-cities" value={form.city} onChange={(e) => change("city", e.target.value)} required />
              <datalist id="submission-cities">{cities.map((city) => <option key={city} value={city} />)}</datalist>
            </label>
            <label>Locality<input value={form.locality} onChange={(e) => change("locality", e.target.value)} required /></label>
          </div>
          <label>Description<textarea value={form.description} onChange={(e) => change("description", e.target.value)} required maxLength="1200" /></label>
          <label>Photo URL (optional)<input type="url" value={form.photo} onChange={(e) => change("photo", e.target.value)} /></label>
          <div className="form-row">
            <label>Latitude<input type="number" step="any" value={form.lat} onChange={(e) => change("lat", e.target.value)} required /></label>
            <label>Longitude<input type="number" step="any" value={form.lng} onChange={(e) => change("lng", e.target.value)} required /></label>
          </div>
          <label>Tags (comma separated)<input value={form.tags} onChange={(e) => change("tags", e.target.value)} placeholder="rooftop, budget" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-action" type="submit" disabled={busy}>{busy ? "Sending…" : "Submit place ✨"}</button>
        </form>
      </section>
    </div>
  );
}
