export default function TopBar({
  cities,
  city,
  onCityChange,
  search,
  onSearchChange,
  onLocate,
  user,
  onShowLogin,
  onLogout,
}) {
  return (
    <header className="topbar">
      <div className="topbar-logo">
        Things<span>Under999</span>
      </div>

      <select className="city-select" value={city} onChange={(e) => onCityChange(e.target.value)}>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="What do you want to do?"
        />
      </div>

      <button className="locate-btn" onClick={onLocate} title="Use my location">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>
      {user ? (
        <div className="account-actions">
          <span className="karma-pill">✨ {user.karma || 0} karma</span>
          <button className="account-btn" onClick={onLogout}>Log out</button>
        </div>
      ) : (
        <button className="account-btn" onClick={onShowLogin}>Log in 💖</button>
      )}
      <a className="admin-entry-link" href="/admin">Admin</a>
    </header>
  );
}
