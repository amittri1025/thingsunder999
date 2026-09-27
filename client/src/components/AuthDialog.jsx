import { useState } from "react";
import { loginUser, registerUser } from "../api";

export default function AuthDialog({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await (mode === "login" ? loginUser : registerUser)({ username, password });
      onAuthenticated(user);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay auth-overlay" onClick={onClose}>
      <section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        <p className="feed-eyebrow">Join the good finds club ✨</p>
        <h2 id="auth-title">{mode === "login" ? "Welcome back!" : "Create your account"}</h2>
        <p className="auth-intro">Save your favorite places and earn community karma for sharing great finds.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input autoComplete="username" minLength="3" maxLength="30" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength="10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {mode === "register" && <p className="field-hint">Use at least 10 characters for your password.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-action" type="submit" disabled={busy}>
            {busy ? "One sec…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
        <button className="text-action" type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </section>
    </div>
  );
}
