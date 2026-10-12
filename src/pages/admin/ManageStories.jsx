
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as adminService from "../../services/adminService";

const getCreatedTime = (story) => {
  const value = story.createdAt ?? story.created_at;

  if (!value) return 0;

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

export default function ManageStories() {
  const [stories, setStories] = useState(null);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    adminService
      .listStories()
      .then((s) => setStories(s || []))
      .catch((e) => setError(e?.message || "Could not load stories."));
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (fn, id) => {
    setBusyId(id);
    setError(null);

    try {
      await fn(id);
      load();
    } catch (e) {
      setError(e?.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const shown = [...(stories || [])]
    .filter((s) => filter === "all" || s.status === filter)
    .sort((a, b) => getCreatedTime(b) - getCreatedTime(a));

  return (
    <div className="cyp-page">
      <Navbar area="ADMIN" />

      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Stories</h1>
          <p>Approve, reject or remove stories across the whole platform.</p>
        </div>

        <div className="cyp-container">
          <div className="cyp-tabs">
            {["all", "PENDING", "PUBLISHED", "DRAFT", "REJECTED"].map((f) => (
              <button
                key={f}
                type="button"
                className={`cyp-tab${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {error && <div className="cyp-form-error">{error}</div>}

          {!stories && !error && <LoadingSpinner />}

          {stories && shown.length === 0 && (
            <div className="cyp-empty">No stories with this status.</div>
          )}

          <div className="cyp-list">
            {shown.map((s) => {
              const id = s._id || s.id;

              return (
                <div key={id} className="cyp-list-row">
                  <div className="cyp-list-main">
                    <div className="cyp-list-title">
                      {s.title}{" "}
                      <span className={`cyp-badge cyp-badge-${s.status}`}>
                        {s.status}
                      </span>
                    </div>

                    <div className="cyp-list-sub">
                      by {s.authorName} · {s.genre} · {s.sceneCount} scenes ·{" "}
                      {s.endingCount} endings · {s.reads} opens
                    </div>

                    {s.description && (
                      <p className="cyp-story-summary">{s.description}</p>
                    )}
                  </div>

                  <div className="cyp-list-actions">
                    <Link
                      to={`/admin/stories/${id}/review`}
                      className="cyp-btn cyp-btn-outline cyp-btn-sm"
                    >
                      Review story
                    </Link>

                    <button
                      type="button"
                      className="cyp-btn cyp-btn-danger cyp-btn-sm"
                      disabled={busyId === id}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete "${s.title}" permanently?`
                          )
                        ) {
                          act(adminService.deleteStory, id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
