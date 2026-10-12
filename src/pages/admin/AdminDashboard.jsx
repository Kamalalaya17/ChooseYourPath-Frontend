import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as adminService from "../../services/adminService";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [stories, setStories] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([adminService.stats(), adminService.listStories()])
      .then(([st, sr]) => {
        if (!alive) return;
        setStats(st);
        setStories(sr || []);
      })
      .catch((e) => alive && setError(e?.message || "Could not load admin data."));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="cyp-page">
      <Navbar area="ADMIN" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Administration</h1>
          <p>Platform health, moderation queue and management shortcuts.</p>
        </div>
        <div className="cyp-container">
          {error && <div className="cyp-form-error">{error}</div>}
          {!stats && !error && <LoadingSpinner />}

          {stats && (
            <>
              <div className="cyp-stat-grid">
                <div className="cyp-stat"><b>{stats.totalReaders}</b><span>readers</span></div>
                <div className="cyp-stat"><b>{stats.totalWriters}</b><span>writers</span></div>
                <div className="cyp-stat"><b>{stats.totalStories}</b><span>stories</span></div>
                <div className="cyp-stat"><b>{stats.published}</b><span>published</span></div>
                <div className="cyp-stat"><b>{stats.pending}</b><span>pending review</span></div>
                <div className="cyp-stat"><b>{stats.drafts}</b><span>drafts</span></div>
                <div className="cyp-stat"><b>{stats.totalComments}</b><span>comments</span></div>
                <div className="cyp-stat"><b>{stats.totalReads}</b><span>story opens</span></div>
              </div>

              <div className="cyp-section-head">
                <div>
                  <h2 style={{ fontSize: 22 }}>Moderation queue</h2>
                  <p>Stories submitted for review.</p>
                </div>
                <Link className="cyp-btn cyp-btn-outline cyp-btn-sm" to="/admin/stories">
                  Manage all stories
                </Link>
              </div>

              {!stories && <LoadingSpinner />}
              {stories && stories.filter((s) => s.status === "PENDING").length === 0 && (
                <div className="cyp-empty">Nothing awaiting review. The queue is clear.</div>
              )}
              <div className="cyp-list">
                {stories &&
                  stories
                    .filter((s) => s.status === "PENDING")
                    .map((s) => (
                      <div key={s._id || s.id} className="cyp-list-row">
                        <div className="cyp-list-main">
                          <div className="cyp-list-title">{s.title}</div>
                          <div className="cyp-list-sub">
                            by {s.authorName} · {s.genre} · {s.sceneCount} scenes · {s.endingCount} endings
                          </div>
                        </div>
                        <Link className="cyp-btn cyp-btn-outline cyp-btn-sm" to={`/admin/stories/${s._id || s.id}/review`}>
                          Review
                        </Link>
                      </div>
                    ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
