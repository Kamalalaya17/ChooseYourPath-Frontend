import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SceneIllustration from "../components/SceneIllustration";

const AREA_META = {
  READER: {
    title: "Create your reader account",
    sub: "One account keeps your progress, favorites and discovered perspectives together.",
    art: "A valley of glowing white moonflowers at night, a silver road of starlight across the flowers, a small distant figure walking the light",
    style: "Celestial",
    caption: "Every path you take is saved.",
    after: "/reader/home",
    loginTo: "/reader/login",
  },
  WRITER: {
    title: "Create your writer account",
    sub: "Open a studio account to craft branching stories — your narrative, your scenes, your endings.",
    art: "A secret dusty clockmaker workshop inside a tower, workbench with an open broken pocket watch whose face shows a tiny painted door, candlelight",
    style: "Ink",
    caption: "Build worlds scene by scene.",
    after: "/writer/dashboard",
    loginTo: "/writer/login",
  },
};

export default function Signup({ area = "READER" }) {
  const meta = AREA_META[area];
  const { signup, error, notice, setError } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => setError(null), [setError]);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const u = await signup(area, username, password, confirm);
    setBusy(false);
    if (u) navigate(meta.after, { replace: true });
  };

  return (
    <div className="cyp-auth">
      <div className="cyp-auth-art">
        <SceneIllustration description={meta.art} style={meta.style} seed={23} />
        <div className="cyp-auth-art-caption">
          <h2>{meta.caption}</h2>
          <p>No email needed — just a username and password.</p>
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
          {notice && <div className="cyp-form-ok">{notice}</div>}

          <form onSubmit={submit}>
            <div className="cyp-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                className="cyp-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. mira_reader"
                autoComplete="username"
                minLength={3}
                maxLength={30}
                required
              />
              <div className="cyp-field-hint">3–30 characters; letters, numbers and underscores.</div>
            </div>
            <div className="cyp-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="cyp-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <div className="cyp-field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                className="cyp-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
            </div>
            <button className="cyp-btn cyp-btn-primary cyp-btn-block" disabled={busy} type="submit">
              {busy ? "Creating account…" : `Create ${area.charAt(0) + area.slice(1).toLowerCase()} account`}
            </button>
          </form>

          <p className="cyp-auth-alt">
            Already have an account? <Link to={meta.loginTo}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
