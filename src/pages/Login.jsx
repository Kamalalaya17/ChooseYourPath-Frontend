import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SceneIllustration from "../components/SceneIllustration";
import LoadingSpinner from "../components/LoadingSpinner";

const AREA_META = {
  READER: {
    title: "Welcome back, reader",
    sub: "Log in to continue your stories, keep your perspectives, and pick up where you left off.",
    art: "A girl standing at the entrance of a vast glowing forest at night, a single blue lantern light flickering between enormous ancient trees, fireflies, mist",
    style: "Watercolor",
    caption: "The forest remembers every reader who answers.",
    after: "/reader/home",
    signupTo: "/reader/signup",
    signupLabel: "New here? Create a reader account",
  },
  WRITER: {
    title: "Writer sign in",
    sub: "Enter the studio to build branching worlds — scenes, choices, consequences, endings.",
    art: "A vast gear room of enormous stopped brass gears, one small wheel turning, lamplight and dust, a figure climbing among them",
    style: "Vintage Illustration",
    caption: "Every world begins with a single scene.",
    after: "/writer/dashboard",
    signupTo: "/writer/signup",
    signupLabel: "New here? Create a writer account",
  },
  ADMIN: {
    title: "Administrator sign in",
    sub: "Management access to users, stories, comments and platform statistics.",
    art: "An observatory dome at night filled with star maps, a telescope pointed at a single bright star, warm lamplight",
    style: "Celestial",
    caption: "The platform, kept in order.",
    after: "/admin/dashboard",
  },
};

export default function Login({ area = "READER" }) {
  const meta = AREA_META[area];
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => setError(null), [setError]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const u = await login(area, username, password);
    setBusy(false);
    if (u) navigate(params.get("returnTo") || meta.after, { replace: true });
  };

  return (
    <div className="cyp-auth">
      <div className="cyp-auth-art">
        <SceneIllustration description={meta.art} style={meta.style} seed={11} />
        <div className="cyp-auth-art-caption">
          <h2>{meta.caption}</h2>
          <p>ChooseYourPath — every choice creates a different story.</p>
        </div>
      </div>
      <div className="cyp-auth-form-side">
        <div className="cyp-auth-card">
          <Link to="/" className="cyp-brand" style={{ marginBottom: 26, display: "inline-flex" }}>
            <span className="cyp-brand-mark">◇</span> ChooseYourPath
          </Link>
          <h1>{meta.title}</h1>
          <p>{meta.sub}</p>

          {error && <div className="cyp-form-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="cyp-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                className="cyp-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                autoComplete="username"
                required
              />
            </div>
            <div className="cyp-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="cyp-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button className="cyp-btn cyp-btn-primary cyp-btn-block" disabled={busy} type="submit">
              {busy ? "Signing in…" : `Log in as ${area.charAt(0) + area.slice(1).toLowerCase()}`}
            </button>
          </form>

          {meta.signupTo && (
            <p className="cyp-auth-alt">
              {meta.signupLabel} — <Link to={meta.signupTo}>sign up</Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
