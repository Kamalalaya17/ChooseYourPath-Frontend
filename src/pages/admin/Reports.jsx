import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as adminService from "../../services/adminService";

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [stories, setStories] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([adminService.stats(), adminService.listStories()])
      .then(([st, sr]) => {
        if (!alive) return;
        setStats(st);
        setStories(sr || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const topRead = (stories || []).slice().sort((a, b) => b.reads - a.reads).slice(0, 5);

  return (
    <div className="cyp-page">
      <Navbar area="ADMIN" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Reports</h1>
          <p>Derived statistics for the whole platform.</p>
        </div>
        <div className="cyp-container">
          {!stats && <LoadingSpinner />}
          {stats && (
            <>
              <div className="cyp-stat-grid">
                <div className="cyp-stat"><b>{stats.totalReads}</b><span>total story opens</span></div>
                <div className="cyp-stat"><b>{stats.totalReaders + stats.totalWriters}</b><span>registered accounts</span></div>
                <div className="cyp-stat">
                  <b>{stats.totalStories ? Math.round((stats.published / stats.totalStories) * 100) : 0}%</b>
                  <span>stories published</span>
                </div>
                <div className="cyp-stat"><b>{stats.totalComments}</b><span>comments posted</span></div>
              </div>

              <div className="cyp-section-head">
                <div>
                  <h2 style={{ fontSize: 22 }}>Most opened stories</h2>
                  <p>Where readers spend their paths.</p>
                </div>
              </div>
              <div className="cyp-list">
                {topRead.map((s, i) => (
                  <div key={s._id || s.id} className="cyp-list-row">
                    <span className="cyp-scene-num">{i + 1}</span>
                    <div className="cyp-list-main">
                      <div className="cyp-list-title">{s.title}</div>
                      <div className="cyp-list-sub">by {s.authorName} · {s.genre}</div>
                    </div>
                    <b style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{s.reads}</b>
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
