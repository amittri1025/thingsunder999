import { useState } from "react";
import { recordVisitor } from "../api";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

export default function CommunityFooter({ city, onSubmitPlace }) {
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [visitorCity, setVisitorCity] = useState(city || "");
  const [state, setState] = useState("");
  const [status, setStatus] = useState("");

  async function shareLocation(event) {
    event.preventDefault();
    setStatus("");
    try {
      let visitorId = window.localStorage.getItem("thingsunder999-visitor-id");
      if (!visitorId) {
        visitorId = window.crypto.randomUUID();
        window.localStorage.setItem("thingsunder999-visitor-id", visitorId);
      }
      await recordVisitor({ visitorId, city: visitorCity, state });
      setStatus("Thanks! Your city and state were shared with the admin team.");
      setShowLocationForm(false);
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <footer className="community-footer">
      <div className="community-submit">
        <span className="community-plus" aria-hidden="true">+</span>
        <div>
          <h2>Found an interesting place?</h2>
          <p>Share it with the community so everyone can enjoy it too ✨</p>
        </div>
        <button className="primary-action" type="button" onClick={onSubmitPlace}>Submit a place 💖</button>
      </div>

      <div className="visitor-opt-in">
        {!showLocationForm ? (
          <button className="text-action" type="button" onClick={() => setShowLocationForm(true)}>
            📍 Share your city & state to help us understand our community (optional)
          </button>
        ) : (
          <form className="visitor-opt-in-form" onSubmit={shareLocation}>
            <p>Your IP address and the city/state you choose will be visible to admins. No GPS coordinates are collected.</p>
            <label>City<input value={visitorCity} onChange={(e) => setVisitorCity(e.target.value)} required /></label>
            <label>State
              <select value={state} onChange={(e) => setState(e.target.value)} required>
                <option value="">Choose a state or union territory</option>
                {STATES.map((place) => <option key={place}>{place}</option>)}
                <option>Other</option>
              </select>
            </label>
            <button className="primary-action" type="submit">I agree — share</button>
            <button className="text-action" type="button" onClick={() => setShowLocationForm(false)}>Cancel</button>
          </form>
        )}
        {status && <p className="visitor-status" role="status">{status}</p>}
      </div>
      <p className="community-signoff">Good finds, good vibes. Made for the curious 💫</p>
    </footer>
  );
}
