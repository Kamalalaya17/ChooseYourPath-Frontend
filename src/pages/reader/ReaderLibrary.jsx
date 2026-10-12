import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StoryCard from "../../components/StoryCard";
import PerspectiveProgress from "../../components/PerspectiveProgress";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as storyService from "../../services/storyService";
import * as readerService from "../../services/readerService";

const TABS = [
  { key: "all", label: "All stories" },
  { key: "started", label: "In progress" },
  { key: "completed", label: "Completed" },
  { key: "favorites", label: "Favorites" },
];

export default function ReaderLibrary() {
  const [tab, setTab] = useState("all");
  const [stories, setStories] = useState(null);
  const [history, setHistory] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [pathsByStory, setPathsByStory] = useState({});
  const [progressByStory, setProgressByStory] = useState({});

  useEffect(() => {
    let alive = true;
    storyService.listStories().then((s) => alive && setStories(s)).catch(() => alive && setStories([]));
    readerService
      .readingHistory()
      .then((h) => {
        if (!alive) return;
        setHistory(h || []);
        const map = {};
        (h || []).forEach((r) => (map[r.storyId] = r));
        setProgressByStory(map);
        // paths per started story
        Promise.all(
          (h || []).map((r) =>
            readerService
              .storyPaths(r.storyId)
              .then((p) => [r.storyId, p])
              .catch(() => [r.storyId, null]),
          ),
        ).then((pairs) => {
          if (!alive) return;
          const pm = {};
          pairs.forEach(([id, p]) => {
            if (p) pm[id] = p;
          });
          setPathsByStory(pm);
        });
      })
      .catch(() => alive && setHistory([]));
    readerService.myFavorites().then((f) => alive && setFavorites(f || [])).catch(() => alive && setFavorites([]));
    return () => {
      alive = false;
    };
  }, []);

  if (!stories || !history || !favorites) {
    return (
      <div className="cyp-page">
        <Navbar area="READER" />
        <LoadingSpinner label="Opening your library…" />
      </div>
    );
  }

  const favIds = new Set(favorites.map((f) => f._id || f.id));
  const completed = Object.values(progressByStory).filter((p) => p.progressPercentage >= 100);
  const started = Object.values(progressByStory).filter((p) => p.progressPercentage < 100);

  let shown = stories;
  if (tab === "started") shown = stories.filter((s) => started.some((p) => (p.storyId) === (s._id || s.id)));
  if (tab === "completed") shown = stories.filter((s) => completed.some((p) => (p.storyId) === (s._id || s.id)));
  if (tab === "favorites") shown = stories.filter((s) => favIds.has(s._id || s.id));

  return (
    <div className="cyp-page">
      <Navbar area="READER" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Your library</h1>
          <p>Every story you've touched, with your progress and discovered perspectives.</p>
        </div>
        <div className="cyp-container">
          <div className="cyp-tabs">
            {TABS.map((t) => (
              <button key={t.key} type="button" className={`cyp-tab${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
                {t.label}
                {t.key === "started" && started.length > 0 && ` (${started.length})`}
                {t.key === "completed" && completed.length > 0 && ` (${completed.length})`}
                {t.key === "favorites" && favorites.length > 0 && ` (${favorites.length})`}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="cyp-empty">
              {tab === "all" ? (
                <>
                  The library is empty for now — <Link to="/reader/stories">browse all stories</Link> to begin.
                </>
              ) : (
                "Nothing here yet."
              )}
            </div>
          ) : (
            <div className="cyp-grid">
              {shown.map((s) => {
                const id = s._id || s.id;
                const paths = pathsByStory[id];
                return (
                  <StoryCard
                    key={id}
                    story={s}
                    progress={progressByStory[id]}
                    paths={paths}
                    cta={favIds.has(id) ? "Read again" : "Read story"}
                  />
                );
              })}
            </div>
          )}

          {tab === "all" && Object.keys(pathsByStory).length === 0 && history.length === 0 && (
            <div style={{ marginTop: 26 }}>
              <div className="cyp-panel">
                <h3>Your perspective journal</h3>
                <p className="cyp-panel-sub">
                  Once you start a story, every named path you discover is recorded here — like this:
                </p>
                <PerspectiveProgress
                  paths={[
                    { pathName: "Path of the Lantern", discovered: false },
                    { pathName: "Path of the River", discovered: false },
                    { pathName: "Path of the Fox", discovered: false },
                    { pathName: "Path of the Shrine", discovered: false },
                  ]}
                  discovered={0}
                  total={4}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
