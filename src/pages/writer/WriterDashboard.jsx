import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as storyService from "../../services/storyService";
import { useAuth } from "../../context/AuthContext";

export default function WriterDashboard() {
  const { user } = useAuth();
  const [stories, setStories] = useState(null);

  useEffect(() => {
    let alive = true;
    storyService
      .myStories()
      .then((s) => alive && setStories(s || []))
      .catch(() => alive && setStories([]));
    return () => {
      alive = false;
    };
  }, []);

  const stats = {
    total: stories?.length ?? 0,
    drafts: stories?.filter((s) => s.status === "DRAFT").length ?? 0,
    pending: stories?.filter((s) => s.status === "PENDING").length ?? 0,
    published: stories?.filter((s) => s.status === "PUBLISHED").length ?? 0,
    scenes: stories?.reduce((n, s) => n + (s.sceneCount || 0), 0) ?? 0,
    endings: stories?.reduce((n, s) => n + (s.endingCount || 0), 0) ?? 0,
  };

  return (
    <div className="cyp-page">
      <Navbar area="WRITER" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 14 }}>
          <div>
            <h1>Writer's studio</h1>
            <p>Welcome, {user?.username} — build branching worlds scene by scene.</p>
          </div>
          <Link className="cyp-btn cyp-btn-primary" to="/writer/create">
            + New story
          </Link>
        </div>

        <div className="cyp-container">
          <div className="cyp-stat-grid">
            <div className="cyp-stat"><b>{stats.total}</b><span>stories</span></div>
            <div className="cyp-stat"><b>{stats.drafts}</b><span>drafts</span></div>
            <div className="cyp-stat"><b>{stats.pending}</b><span>in review</span></div>
            <div className="cyp-stat"><b>{stats.published}</b><span>published</span></div>
            <div className="cyp-stat"><b>{stats.scenes}</b><span>scenes written</span></div>
            <div className="cyp-stat"><b>{stats.endings}</b><span>endings crafted</span></div>
          </div>

          <div className="cyp-section-head">
            <div>
              <h2 style={{ fontSize: 22 }}>My stories</h2>
              <p>Your catalog — drafts, in-review and published.</p>
            </div>
            <Link className="cyp-btn cyp-btn-outline cyp-btn-sm" to="/writer/stories">
              Manage all stories
            </Link>
          </div>

          {!stories && <LoadingSpinner />}
          {stories && stories.length === 0 && (
            <div className="cyp-empty">
              You haven't created a story yet. Start with a narrative — the scenes, choices and
              endings grow from it.
            </div>
          )}
          <div className="cyp-list">
            {(stories || []).slice(0, 5).map((s) => (
              <Link key={s._id || s.id} to={`/writer/edit/${s._id || s.id}`} className="cyp-list-row">
                <span className="cyp-scene-num" style={{ background: "var(--bg-soft)", color: "var(--ink-soft)" }}>
                  {s.sceneCount}
                </span>
                <div className="cyp-list-main">
                  <div className="cyp-list-title">{s.title}</div>
                  <div className="cyp-list-sub">
                    {s.genre} · {s.sceneCount} scenes · {s.endingCount} endings
                  </div>
                </div>
                <span className={`cyp-badge cyp-badge-${s.status}`}>{s.status}</span>
                <span className="cyp-btn cyp-btn-outline cyp-btn-sm">Open builder</span>
              </Link>
            ))}
          </div>

          {stories && stories.length > 0 && (
            <div style={{ marginTop: 26 }} className="cyp-panel">
              <h3>How stories grow</h3>
              <p className="cyp-panel-sub">
                Write the narrative, add scenes, wire choices to next scenes, and let readers
                discover your paths. No artwork upload — the platform illustrates every scene
                from your scene descriptions in four visual styles.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
