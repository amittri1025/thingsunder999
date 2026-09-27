import { useEffect, useState } from "react";
import { FiArrowLeft, FiStar } from "react-icons/fi";
import { adminAction, adminLogin, adminLogout, getAdminData, getAdminSession } from "../api";
import { CATEGORIES } from "../constants";

const EMPTY_LISTING = {
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

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("listings");
  const [listings, setListings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [visitorState, setVisitorState] = useState("");
  const [visitorCity, setVisitorCity] = useState("");
  const [listingForm, setListingForm] = useState(EMPTY_LISTING);

  useEffect(() => {
    getAdminSession()
      .then(() => setAuthenticated(true))
      .catch((error) => {
        setAuthenticated(false);
        if (error.status !== 401) setError(error.message);
      })
      .finally(() => setChecking(false));
  }, []);

  async function loadData() {
    setError("");
    try {
      const [allListings, pending, allUsers] = await Promise.all([
        getAdminData("listings"),
        getAdminData("submissions"),
        getAdminData("users"),
      ]);
      setListings(allListings);
      setSubmissions(pending);
      setUsers(allUsers);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    try {
      await adminLogin({ username, password });
      setAuthenticated(true);
      setPassword("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleLogout() {
    try {
      await adminLogout();
      setAuthenticated(false);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function createListing(event) {
    event.preventDefault();
    setError("");
    try {
      await adminAction("listings", "POST", {
        name: listingForm.name,
        category: listingForm.category,
        price: Number(listingForm.price),
        city: listingForm.city,
        locality: listingForm.locality,
        description: listingForm.description,
        photos: listingForm.photo ? [listingForm.photo] : [],
        coordinates: { lat: Number(listingForm.lat), lng: Number(listingForm.lng) },
        tags: listingForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        thingsToKnow: [],
        status: "published",
      });
      setListingForm(EMPTY_LISTING);
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteListing(id) {
    if (!window.confirm("Delete this place permanently?")) return;
    try {
      await adminAction(`listings/${id}`, "DELETE");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function flagListing(listing) {
    try {
      await adminAction(`listings/${listing._id}/flag`, "PATCH", {
        flagged: listing.status !== "flagged",
      });
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateUser(user) {
    try {
      await adminAction(`users/${user._id}/block`, "PATCH", { blocked: !user.blocked });
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function reviewSubmission(submission, status) {
    try {
      await adminAction(`submissions/${submission._id}`, "PATCH", { status });
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function searchVisitors(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (visitorState) params.set("state", visitorState);
    if (visitorCity) params.set("city", visitorCity);
    setError("");
    try {
      setVisitors(await getAdminData(`visitors?${params.toString()}`));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (checking) return <main className="admin-page"><p>Checking admin session…</p></main>;

  if (!authenticated) {
    return (
      <main className="admin-page admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <a className="admin-home-link" href="/"><FiArrowLeft aria-hidden="true" /> Back to discoveries</a>
          <p className="feed-eyebrow">Restricted access</p>
          <h1>Admin dashboard</h1>
          <label>Username<input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-action" type="submit">Log in securely</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <a className="admin-home-link" href="/"><FiArrowLeft aria-hidden="true" /> Main site</a>
          <p className="feed-eyebrow">ThingsUnder999 control room</p>
          <h1>Admin dashboard <FiStar aria-hidden="true" /></h1>
        </div>
        <button className="secondary-action" onClick={handleLogout}>Log out</button>
      </header>
      {error && <p className="form-error admin-error" role="alert">{error}</p>}
      <nav className="admin-tabs" aria-label="Admin sections">
        {["listings", "submissions", "users", "visitors"].map((section) => (
          <button className={tab === section ? "admin-tab-active" : ""} key={section} onClick={() => setTab(section)}>
            {section === "listings" ? "Places" : section === "submissions" ? "Community submissions" : section === "users" ? "Users" : "Visitors"}
          </button>
        ))}
      </nav>

      {tab === "listings" && (
        <section className="admin-section">
          <h2>Add a published place</h2>
          <form className="admin-listing-form" onSubmit={createListing}>
            <label>Name<input value={listingForm.name} onChange={(e) => setListingForm({ ...listingForm, name: e.target.value })} required /></label>
            <label>Category<select value={listingForm.category} onChange={(e) => setListingForm({ ...listingForm, category: e.target.value })}>{CATEGORIES.filter((value) => value !== "All").map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>Price ₹<input type="number" min="0" max="999" value={listingForm.price} onChange={(e) => setListingForm({ ...listingForm, price: e.target.value })} required /></label>
            <label>City<input value={listingForm.city} onChange={(e) => setListingForm({ ...listingForm, city: e.target.value })} required /></label>
            <label>Locality<input value={listingForm.locality} onChange={(e) => setListingForm({ ...listingForm, locality: e.target.value })} required /></label>
            <label>Description<input value={listingForm.description} onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })} required /></label>
            <label>Photo URL<input type="url" value={listingForm.photo} onChange={(e) => setListingForm({ ...listingForm, photo: e.target.value })} /></label>
            <label>Latitude<input type="number" step="any" value={listingForm.lat} onChange={(e) => setListingForm({ ...listingForm, lat: e.target.value })} required /></label>
            <label>Longitude<input type="number" step="any" value={listingForm.lng} onChange={(e) => setListingForm({ ...listingForm, lng: e.target.value })} required /></label>
            <label>Tags (comma separated)<input value={listingForm.tags} onChange={(e) => setListingForm({ ...listingForm, tags: e.target.value })} /></label>
            <button className="primary-action" type="submit">Add place +</button>
          </form>
          <h2>All places ({listings.length})</h2>
          <div className="admin-record-list">
            {listings.map((listing) => (
              <article className="admin-record" key={listing._id}>
                <div><strong>{listing.name}</strong><span>{listing.locality}, {listing.city} · ₹{listing.price}</span></div>
                <div className="admin-record-actions">
                  <button className="secondary-action" onClick={() => flagListing(listing)}>
                    {listing.status === "flagged" ? "Restore place" : "Mark as spam"}
                  </button>
                  <button className="danger-action" onClick={() => deleteListing(listing._id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "submissions" && (
        <section className="admin-section">
          <h2>Places shared by the community</h2>
          {submissions.map((submission) => (
            <article className="admin-record submission-record" key={submission._id}>
              <div><strong>{submission.name}</strong><span>{submission.locality}, {submission.city} · {submission.category} · ₹{submission.price}</span><p>{submission.description}</p></div>
              <div className="admin-record-actions">
                <button className="primary-action" onClick={() => reviewSubmission(submission, "approved")}>Approve + karma</button>
                <button className="danger-action" onClick={() => reviewSubmission(submission, "rejected")}>Reject</button>
              </div>
            </article>
          ))}
          {submissions.length === 0 && <p className="feed-message">No pending community submissions.</p>}
        </section>
      )}

      {tab === "users" && (
        <section className="admin-section">
          <h2>Community accounts ({users.length})</h2>
          <div className="admin-record-list">
            {users.map((user) => (
              <article className="admin-record" key={user._id}>
                <div><strong>{user.username}</strong><span>{user.karma} karma · joined {new Date(user.createdAt).toLocaleDateString()}</span></div>
                <button className={user.blocked ? "secondary-action" : "danger-action"} onClick={() => updateUser(user)}>
                  {user.blocked ? "Unblock" : "Block user"}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "visitors" && (
        <section className="admin-section">
          <h2>Visitor activity</h2>
          <p className="auth-intro">City/state are self-selected by visitors who opted in. IP addresses are collected by the server and visible only to admins.</p>
          <form className="visitor-filters" onSubmit={searchVisitors}>
            <label>State<input value={visitorState} onChange={(e) => setVisitorState(e.target.value)} /></label>
            <label>City<input value={visitorCity} onChange={(e) => setVisitorCity(e.target.value)} /></label>
            <button className="primary-action" type="submit">Filter visitors</button>
          </form>
          <div className="admin-record-list">
            {visitors.map((visitor) => (
              <article className="admin-record" key={visitor.visitorId}>
                <div><strong>{visitor.city || "Location not shared"}, {visitor.state || "—"}</strong><span>{new Date(visitor.lastSeenAt).toLocaleString()}</span></div>
                <code>{visitor.ipAddress}</code>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
