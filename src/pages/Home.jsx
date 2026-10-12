import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as storyService from "../services/storyService";
import StoryCard from "../components/StoryCard";
import LoadingSpinner from "../components/LoadingSpinner";

const GENRES = ["Fantasy / Mystery", "Mystery / Fantasy", "Adventure / Fantasy", "Fantasy", "Mystery", "Adventure"];

const PORTALS = [
  {
    title: "Read",
    to: "/reader/login",
    desc: "Follow branching stories, discover every perspective, and see where your choices lead.",
    cta: "Enter the library",
  },
  {
    title: "Write",
    to: "/writer/login",
    desc: "Build worlds scene by scene. Define the narrative, wire the choices, craft the endings.",
    cta: "Open the studio",
  },
  {
    title: "Admin",
    to: "/admin/login",
    desc: "Platform management — users, stories, comments and statistics.",
    cta: "Administrator sign in",
  },
];

function howItWorks() {
  return [
    { icon: "📖", title: "Read", body: "Every story unfolds scene by scene, each one fully illustrated." },
    { icon: "🔀", title: "Choose", body: "At every crossroads your choice carries a named path and a consequence." },
    { icon: "✨", title: "Discover", body: "Each path is a different perspective. Find them all — the library keeps count." },
  ];
}

export default function Home() {
  const { user } = useAuth();
  const [stories, setStories] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    storyService
      .listStories()
      .then((s) => alive && setStories(s))
      .catch((e) => alive && setError(e?.message || "Could not load stories."));
    return () => {
      alive = false;
    };
  }, []);

  const home = user ? (user.role === "READER" ? "/reader/home" : user.role === "WRITER" ? "/writer/dashboard" : "/admin/dashboard") : null;

  return (
    <div className="cyp-page">
      {/* Hero */}
      <section className="cyp-hero">
        <div className="cyp-container">
          <span className="cyp-hero-badge">✦ An interactive story platform</span>
          <h1>Every Choice Creates a Different Story.</h1>
          <p>Read. Choose. Discover where your path leads.</p>
          <div className="cyp-hero-ctas">
            <Link className="cyp-btn cyp-btn-primary cyp-btn-lg" to="/browse">
              Explore Stories
            </Link>
            <Link className="cyp-btn cyp-btn-outline cyp-btn-lg" to="/reader/login">
              Start Reading
            </Link>
            <Link className="cyp-btn cyp-btn-outline cyp-btn-lg" to="/writer/login">
              Become a Writer
            </Link>
          </div>
        </div>
      </section>

      {/* Featured stories */}
      <section className="cyp-section">
        <div className="cyp-container">
          <div className="cyp-section-head">
            <div>
              <h2>Featured Stories</h2>
              <p>Three branching worlds, each with named paths and multiple endings.</p>
            </div>
            <Link className="cyp-btn cyp-btn-outline cyp-btn-sm" to="/browse">
              View all
            </Link>
          </div>
          {error && <div className="cyp-form-error">{error}</div>}
          {!stories && !error && <LoadingSpinner label="Opening the library…" />}
          {stories && (
            <div className="cyp-grid">
              {stories.slice(0, 3).map((s) => (
                <StoryCard key={s._id || s.id} story={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="cyp-section cyp-section-alt">
        <div className="cyp-container">
          <div className="cyp-section-head">
            <div>
              <h2>How ChooseYourPath Works</h2>
              <p>A story is a tree of scenes. You decide which branches to walk.</p>
            </div>
          </div>
          <div className="cyp-grid-3">
            {howItWorks().map((s) => (
              <div key={s.title} className="cyp-panel">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p className="cyp-panel-sub" style={{ marginBottom: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals */}
      <section className="cyp-section">
        <div className="cyp-container">
          <div className="cyp-section-head">
            <div>
              <h2>Different Perspectives</h2>
              <p>Three doors, three ways in. Each area is its own world.</p>
            </div>
          </div>
          <div className="cyp-grid-3">
            {PORTALS.map((p) => (
              <div key={p.title} className="cyp-panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <h3>{p.title}</h3>
                <p className="cyp-panel-sub" style={{ marginBottom: 6 }}>{p.desc}</p>
                <Link className="cyp-btn cyp-btn-primary cyp-btn-sm" to={p.to} style={{ alignSelf: "flex-start", marginTop: "auto" }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="cyp-footer">
        <div className="cyp-container cyp-footer-inner">
          <span>◇ ChooseYourPath — every choice creates a different story.</span>
          <span>
            {user ? (
              <Link to={home}>Continue as {user.username} →</Link>
            ) : (
              <span>Reader · Writer · Admin portals</span>
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}
