import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StoryCard from "../../components/StoryCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import SceneIllustration from "../../components/SceneIllustration";
import * as storyService from "../../services/storyService";
import * as readerService from "../../services/readerService";
import { useAuth } from "../../context/AuthContext";

export default function ReaderHome() {
  const { user } = useAuth();
  const [stories, setStories] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    let alive = true;
    storyService.listStories().then((s) => alive && setStories(s)).catch(() => alive && setStories([]));
    readerService.readingHistory().then((h) => alive && setHistory(h)).catch(() => alive && setHistory([]));
    return () => {
      alive = false;
    };
  }, []);

  const inProgress = (history || []).filter((h) => h.progressPercentage < 100).slice(0, 3);

  return (
    <div className="cyp-page">
      <Navbar area="READER" />
      <div className="cyp-page-body">
        {/* Welcome hero */}
        <section
          style={{
            position: "relative",
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            <SceneIllustration
              description="A valley of glowing white moonflowers at night, a silver road of starlight across the flowers"
              style="Celestial"
              seed={7}
            />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(10,12,16,0.72), rgba(10,12,16,0.25))",
            }}
          />
          <div className="cyp-container" style={{ position: "relative", zIndex: 2, padding: "48px 24px", color: "#f5efe2" }}>
            <p style={{ margin: "0 0 6px", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9a24b", fontWeight: 700 }}>
              Reader's study
            </p>
            <h1 style={{ margin: "0 0 10px", fontSize: "clamp(28px, 4vw, 42px)" }}>
              Welcome back, {user?.username}
            </h1>
            <p style={{ margin: 0, maxWidth: 520, color: "rgba(245,239,226,0.85)", lineHeight: 1.6 }}>
              Your stories are waiting exactly where you left them — and there are paths you
              haven't walked yet.
            </p>
          </div>
        </section>

        {/* Continue reading */}
        <section className="cyp-section" style={{ paddingTop: 40 }}>
          <div className="cyp-container">
            <div className="cyp-section-head">
              <div>
                <h2>Continue reading</h2>
                <p>Pick up any story at the exact scene where you stopped.</p>
              </div>
              <Link className="cyp-btn cyp-btn-outline cyp-btn-sm" to="/reader/history">
                Reading history
              </Link>
            </div>
            {!history && <LoadingSpinner />}
            {history && inProgress.length === 0 && (
              <div className="cyp-empty">
                Nothing in progress yet. <Link to="/reader/library" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>Open the library</Link> and start your first story.
              </div>
            )}
            {history && inProgress.length > 0 && (
              <div className="cyp-list">
                {inProgress.map((h) => (
                  <Link key={h.storyId || h.id} to={`/reader/read/${h.storyId || h.id}`} className="cyp-list-row">
                    <div className="cyp-list-main">
                      <div className="cyp-list-title">{h.title}</div>
                      <div className="cyp-list-sub">
                        {h.genre} — {h.progressPercentage}% read
                      </div>
                    </div>
                    <span className="cyp-btn cyp-btn-primary cyp-btn-sm">Continue</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured */}
        <section className="cyp-section cyp-section-alt" style={{ paddingBottom: 56 }}>
          <div className="cyp-container">
            <div className="cyp-section-head">
              <div>
                <h2>Featured stories</h2>
                <p>Branching worlds from the community — each with named paths and multiple endings.</p>
              </div>
              <Link className="cyp-btn cyp-btn-outline cyp-btn-sm" to="/reader/library">
                Full library
              </Link>
            </div>
            {!stories && <LoadingSpinner />}
            {stories && (
              <div className="cyp-grid">
                {stories.slice(0, 3).map((s) => (
                  <StoryCard key={s._id || s.id} story={s} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
