import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SceneIllustration from "../../components/SceneIllustration";
import PerspectiveProgress from "../../components/PerspectiveProgress";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";
import * as storyService from "../../services/storyService";
import * as readerService from "../../services/readerService";
import { useAuth } from "../../context/AuthContext";

export default function ReaderStory() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState(undefined);
  const [scenes, setScenes] = useState([]);
  const [styles, setStyles] = useState([]);
  const [paths, setPaths] = useState(null);
  const [progress, setProgress] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [confirmStart, setConfirmStart] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      storyService.getStory(storyId),
      storyService.getScenes(storyId),
      storyService.getStyles(storyId),
      readerService.storyPaths(storyId).catch(() => null),
      readerService.getProgress(storyId).catch(() => null),
      readerService.isFavorite(storyId).catch(() => false),
      readerService.listComments(storyId).catch(() => []),
    ])
      .then(([s, sc, st, p, pr, fav, cm]) => {
        if (!alive) return;
        setStory(s);
        setScenes(sc || []);
        setStyles(st || []);
        setPaths(p);
        setProgress(pr);
        setFavorite(Boolean(fav));
        setComments(cm || []);
      })
      .catch((e) => alive && setError(e?.message || "Could not load this story."));
    return () => {
      alive = false;
    };
  }, [storyId]);

  if (error) {
    return (
      <div className="cyp-page">
        <Navbar area="READER" />
        <div className="cyp-container" style={{ padding: "80px 24px", textAlign: "center" }}>
          <h1>Story unavailable</h1>
          <p style={{ color: "var(--ink-soft)" }}>{error}</p>
          <Link to="/reader/library" className="cyp-btn cyp-btn-outline">Back to library</Link>
        </div>
      </div>
    );
  }
  if (story === undefined) {
    return (
      <div className="cyp-page">
        <Navbar area="READER" />
        <LoadingSpinner label="Opening the story…" />
      </div>
    );
  }
  if (!story) {
    return (
      <div className="cyp-page">
        <Navbar area="READER" />
        <div className="cyp-container" style={{ padding: "80px 24px", textAlign: "center" }}>
          <h1>Story not found</h1>
          <p style={{ color: "var(--ink-soft)" }}>It may have been unpublished or removed.</p>
          <Link to="/reader/library" className="cyp-btn cyp-btn-outline">Back to library</Link>
        </div>
      </div>
    );
  }

  const endingScenes = scenes.filter((s) => s.isEnding);
  const startScene = scenes.find((s) => s.sceneOrder === 1);
  const resumeScene = progress?.currentSceneId;

  const begin = () => {
    if (!user) {
      navigate(`/reader/login?returnTo=${encodeURIComponent(`/reader/story/${storyId}`)}`);
      return;
    }
    if (resumeScene && progress.progressPercentage < 100) {
      navigate(`/reader/read/${storyId}`);
    } else if (startScene) {
      setConfirmStart(true);
    }
  };

  const startFresh = () => {
    setConfirmStart(false);
    if (startScene) navigate(`/reader/read/${storyId}?scene=${startScene._id || startScene.id}&fresh=1`);
  };

  const toggleFav = async () => {
    const next = await readerService.toggleFavorite(storyId);
    setFavorite(Boolean(next));
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await readerService.addComment(storyId, commentText);
    setCommentText("");
    const cm = await readerService.listComments(storyId);
    setComments(cm || []);
  };

  return (
    <div className="cyp-page">
      <Navbar area="READER" />

      {/* Full-bleed cover */}
      <section className="cyp-detail-hero">
        <SceneIllustration
          description={story.narrative || story.description}
          style={story.coverStyle}
          seed={17}
        />
        <div className="cyp-detail-hero-shade" />
        <div className="cyp-detail-hero-content">
          <div className="cyp-container">
            <div>
              <span className="cyp-badge cyp-badge-PUBLISHED">{story.genre}</span>
              <h1>{story.title}</h1>
              <div className="cyp-card-meta" style={{ marginBottom: 8 }}>
                <span>by {story.authorName}</span>
                <span>{story.sceneCount} scenes</span>
                <span>{story.endingCount} endings</span>
                {story.theme && <span>theme: {story.theme}</span>}
              </div>
              <p className="cyp-detail-desc">{story.description}</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="cyp-btn cyp-btn-primary cyp-btn-lg" onClick={begin}>
                {resumeScene && progress.progressPercentage < 100
                  ? `Continue — ${progress.progressPercentage}%`
                  : "Start reading"}
              </button>
              <button type="button" className="cyp-btn cyp-btn-outline cyp-btn-lg" style={{ color: "#f5efe2", borderColor: "rgba(245,239,226,0.4)" }} onClick={toggleFav}>
                {favorite ? "★ Favorited" : "☆ Add to favorites"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="cyp-container cyp-detail-body">
        {/* Narrative + structure */}
        <div className="cyp-detail-section">
          <h3>The narrative</h3>
          <div className="cyp-narrative-block">{story.narrative}</div>
          {story.writingStyle && (
            <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>
              Writing style: {story.writingStyle}
            </p>
          )}

          <h3 style={{ marginTop: 26 }}>Available visual styles</h3>
          <div className="cyp-path-chips">
            {styles.map((s) => {
              const name = typeof s === "string" ? s : s.styleName;
              return (
                <span key={name} className="cyp-path-chip found">◈ {name}</span>
              );
            })}
          </div>

          <h3 style={{ marginTop: 26 }}>Comments ({comments.length})</h3>
          {user && (
            <form onSubmit={postComment} style={{ marginBottom: 14 }}>
              <textarea
                className="cyp-textarea"
                style={{ minHeight: 70 }}
                placeholder="Share what you thought of this story…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={1000}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button className="cyp-btn cyp-btn-primary cyp-btn-sm" type="submit" disabled={!commentText.trim()}>
                  Post comment
                </button>
              </div>
            </form>
          )}
          {comments.length === 0 && <p style={{ color: "var(--ink-faint)", fontSize: 13.5 }}>No comments yet.</p>}
          {comments.map((c) => (
            <div key={c._id || c.id} className="cyp-comment">
              <div className="cyp-comment-head">
                <span className="cyp-comment-author">{c.authorName || c.username}</span>
                {user && (c.userId === user._id || c.userId === user.id) && (
                  <button
                    type="button"
                    className="cyp-btn cyp-btn-danger cyp-btn-sm"
                    onClick={async () => {
                      await readerService.deleteComment(c._id || c.id);
                      setComments((cs) => cs.filter((x) => (x._id || x.id) !== (c._id || c.id)));
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="cyp-comment-text">{c.commentText || c.text}</p>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div>
          <div className="cyp-panel" style={{ marginBottom: 18 }}>
            <h3>Perspectives</h3>
            <p className="cyp-panel-sub">
              {paths ? `${paths.discovered} of ${paths.total} discovered` : "Sign in to track your paths"}
            </p>
            {paths && <PerspectiveProgress paths={paths.paths} discovered={paths.discovered} total={paths.total} />}
          </div>
          <div className="cyp-panel">
            <h3>Story structure</h3>
            <p className="cyp-panel-sub">{scenes.length} scenes · {endingScenes.length} endings</p>
            <div className="cyp-list">
              {scenes.slice(0, 8).map((s) => (
                <div key={s._id || s.id} className="cyp-list-row" style={{ padding: "9px 12px" }}>
                  <span className="cyp-scene-num">{s.sceneOrder}</span>
                  <div className="cyp-list-main">
                    <div className="cyp-list-title" style={{ fontSize: 13.5 }}>
                      {s.title} {s.isEnding && <span className="cyp-badge cyp-badge-PENDING">ending</span>}
                    </div>
                  </div>
                </div>
              ))}
              {scenes.length > 8 && (
                <div className="cyp-list-sub" style={{ paddingLeft: 4 }}>+{scenes.length - 8} more scenes…</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirmStart && (
        <Modal
          title="Start from the beginning?"
          subtitle="You've read this story before. You can start fresh — your discovered perspectives are always kept."
          onClose={() => setConfirmStart(false)}
          actions={
            <>
              <button type="button" className="cyp-btn cyp-btn-outline" onClick={() => setConfirmStart(false)}>
                Cancel
              </button>
              <button type="button" className="cyp-btn cyp-btn-primary" onClick={startFresh}>
                Start from scene 1
              </button>
            </>
          }
        >
          <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: 0 }}>
            Paths you've already discovered stay checked in your journal.
          </p>
        </Modal>
      )}
    </div>
  );
}
