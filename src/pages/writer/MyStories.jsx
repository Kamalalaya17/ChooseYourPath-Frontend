
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as storyService from "../../services/storyService";

const getCreatedTime = (story) => {
  const value = story.createdAt ?? story.created_at;

  if (!value) return 0;

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

export default function MyStories() {
  const [stories, setStories] = useState(null);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    storyService
      .myStories()
      .then((s) => setStories(s || []))
      .catch((e) => setError(e?.message || "Could not load your stories."));
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

  if (error && !stories) {
    return (
      <div className="cyp-page">
        <Navbar area="WRITER" />
        <div className="cyp-container" style={{ padding: "80px 24px" }}>
          <div className="cyp-form-error">{error}</div>
        </div>
      </div>
    );
  }

  const shown = [...(stories || [])]
    .filter((s) => filter === "all" || s.status === filter)
    .sort((a, b) => getCreatedTime(b) - getCreatedTime(a));

  return (
    <div className="cyp-page">
      <Navbar area="WRITER" />

      <div className="cyp-page-body">
        <div
          className="cyp-container cyp-page-head"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div>
            <h1>My stories</h1>
            <p>Everything you've written — edit, submit, publish, or retire.</p>
          </div>

          <Link className="cyp-btn cyp-btn-primary" to="/writer/create">
            + New story
          </Link>
        </div>

        <div className="cyp-container">
          <div className="cyp-tabs">
            {["all", "DRAFT", "PENDING", "PUBLISHED", "REJECTED"].map((f) => (
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

          {!stories && <LoadingSpinner />}

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
                      {s.genre} · {s.sceneCount} scenes · {s.endingCount}{" "}
                      endings · created{" "}
                      {getCreatedTime(s)
                        ? new Date(getCreatedTime(s)).toLocaleDateString()
                        : "date unavailable"}
                    </div>
                  </div>

                  <div className="cyp-list-actions">
                    <Link
                      className="cyp-btn cyp-btn-outline cyp-btn-sm"
                      to={`/writer/edit/${id}`}
                    >
                      Story builder
                    </Link>

                    {s.status === "DRAFT" && (
                      <button
                        type="button"
                        className="cyp-btn cyp-btn-primary cyp-btn-sm"
                        disabled={busyId === id}
                        onClick={() => act(storyService.submitForReview, id)}
                      >
                        Submit for review
                      </button>
                    )}

                    {s.status === "PUBLISHED" && (
                      <button
                        type="button"
                        className="cyp-btn cyp-btn-outline cyp-btn-sm"
                        disabled={busyId === id}
                        onClick={() => act(storyService.unpublish, id)}
                      >
                        Unpublish
                      </button>
                    )}

                    <button
                      type="button"
                      className="cyp-btn cyp-btn-danger cyp-btn-sm"
                      disabled={busyId === id}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete "${s.title}"? This cannot be undone.`
                          )
                        ) {
                          act(storyService.deleteStory, id);
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
