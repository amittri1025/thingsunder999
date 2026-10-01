import { FiAward, FiCrosshair, FiLogIn, FiLogOut, FiSearch } from "react-icons/fi";

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
<a className="topbar-logo" href="/" aria-label="Nazara home">
  <img
    src="/logo.png"
    alt="Nazara"
        className="topbar-logo-img"

    onError={(e) => {
      e.currentTarget.style.display = "none";
      e.currentTarget.nextElementSibling.style.display = "inline";
    }}
  />
  <span style={{ display: "none" }}>Nazara</span>
</a>

      <select className="city-select" value={city} onChange={(e) => onCityChange(e.target.value)}>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="search-box">
        <FiSearch aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search discoveries"
          placeholder="Find your next little adventure"
        />
      </div>

      <button className="locate-btn" type="button" onClick={onLocate} title="Use my location" aria-label="Use my location">
        <FiCrosshair aria-hidden="true" />
      </button>
      {user ? (
        <div className="account-actions">
          <span className="karma-pill"><FiAward aria-hidden="true" /> {user.karma || 0} karma</span>
          <button className="account-btn" type="button" onClick={onLogout}><FiLogOut aria-hidden="true" /> Log out</button>
        </div>
      ) : (
        <button className="account-btn" type="button" onClick={onShowLogin}><FiLogIn aria-hidden="true" /> Log in</button>
      )}
    </header>
  );
}
