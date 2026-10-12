import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import SceneIllustration from "../../components/SceneIllustration";
import ChoiceButton from "../../components/ChoiceButton";
import StyleSelector from "../../components/StyleSelector";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as storyService from "../../services/storyService";
import * as readerService from "../../services/readerService";
import { useAuth } from "../../context/AuthContext";

export default function ReaderRead() {
  const { storyId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [story, setStory] = useState(undefined);
  const [styles, setStyles] = useState([]);
  const [style, setStyle] = useState(null);
  const [sceneId, setSceneId] = useState(params.get("scene"));
  const [sceneData, setSceneData] = useState(null);
  const [sceneImage, setSceneImage] = useState(null);
  const [pathInfo, setPathInfo] = useState(null);
  const [visited, setVisited] = useState(() => new Set());
  const [lastChoiceWasNew, setLastChoiceWasNew] = useState(false);
  const [loadingScene, setLoadingScene] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const savedForScene = useRef(null);

  // Load story + styles once
  useEffect(() => {
    let alive = true;
    Promise.all([storyService.getStory(storyId), storyService.getStyles(storyId)])
      .then(([s, st]) => {
        if (!alive) return;
        setStory(s);
        setStyles(st || []);
        const names = (st || []).map((x) => (typeof x === "string" ? x : x.styleName));
        // Persisted reader choice > story's own cover style > first offered.
        let preferred = names[0] || "Classic Storybook";
        if (s?.coverStyle && names.includes(s.coverStyle)) preferred = s.coverStyle;
        const saved = localStorage.getItem(`cyp_style_${storyId}`);
        if (saved && names.includes(saved)) preferred = saved;
        setStyle(preferred);
      })
      .catch((e) => alive && setError(e?.message || "Could not load this story."));
    return () => {
      alive = false;
    };
  }, [storyId]);

  // Pick the starting scene (URL param > saved progress > first scene)
  useEffect(() => {
    let alive = true;
    if (sceneId || !story) return;
    if (params.get("fresh")) {
      storyService
        .getScenes(storyId)
        .then((scenes) => {
          if (!alive) return;
          const first = (scenes || []).find((s) => s.sceneOrder === 1);
          if (first) setSceneId(first._id || first.id);
        })
        .catch(() => alive && setError("Could not open the story."));
      return;
    }
    readerService
      .getProgress(storyId)
      .then((p) => {
        if (!alive) return;
        if (p?.currentSceneId) setSceneId(p.currentSceneId);
        else
          storyService
            .getScenes(storyId)
            .then((scenes) => {
              if (!alive) return;
              const first = (scenes || []).find((s) => s.sceneOrder === 1);
              if (first) setSceneId(first._id || first.id);
            })
            .catch(() => alive && setError("Could not open the story."));
      })
      .catch(() => {
        storyService
          .getScenes(storyId)
          .then((scenes) => {
            if (!alive) return;
            const first = (scenes || []).find((s) => s.sceneOrder === 1);
            if (first) setSceneId(first._id || first.id);
          })
          .catch(() => alive && setError("Could not open the story."));
      });
    return () => {
      alive = false;
    };
  }, [story, storyId, sceneId, params]);

  // Load current scene + its per-style illustration
  useEffect(() => {
    let alive = true;
    if (!sceneId) return;
    setLoadingScene(true);
    Promise.all([
      storyService.getScene(sceneId),
      storyService.getSceneImage(sceneId).catch(() => null),
    ])
      .then(([sd, img]) => {
        if (!alive) return;
        setSceneData(sd);
        setSceneImage(img);
        setLoadingScene(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "Could not load this scene.");
        setLoadingScene(false);
      });
    return () => {
      alive = false;
    };
  }, [sceneId]);

  // Save progress once per scene (only for signed-in readers)
  useEffect(() => {
    if (!sceneId || !user || !token) return;
    if (savedForScene.current === sceneId) return;
    savedForScene.current = sceneId;
    readerService
      .saveProgress(storyId, sceneId)
      .then(() => setSaveError(null))
      .catch(() => setSaveError("Progress will save when the connection returns."));
  }, [sceneId, user, token, storyId]);

  const choose = useCallback(
    async (choice) => {
      const id = choice._id || choice.id;
      const nextScene = choice.nextSceneId || choice.next_scene_id;
      if (!nextScene) return;
      setLastChoiceWasNew(false);
      if (user && token) {
        try {
          const res = await readerService.discoverPath(storyId, id);
          if (res?.isNew) setLastChoiceWasNew(true);
        } catch {
          // discovery is best-effort
        }
      }
      setVisited((v) => new Set(v).add(sceneId));
      setParams({ scene: nextScene }, { replace: true });
      setSceneId(nextScene);
      window.scrollTo({ top: 0 });
    },
    [storyId, user, token, sceneId, setParams],
  );

  const restart = async () => {
    const scenes = await storyService.getScenes(storyId);
    const first = (scenes || []).find((s) => s.sceneOrder === 1);
    if (first) {
      setSceneId(first._id || first.id);
      setParams({ scene: first._id || first.id }, { replace: true });
      window.scrollTo({ top: 0 });
    }
  };

  const goBack = () => {
    if (visited.size === 0) {
      navigate(`/reader/story/${storyId}`);
      return;
    }
    // Step back through visited scenes in order
    const arr = [...visited];
    const prev = arr[arr.length - 1];
    arr.pop();
    setVisited(new Set(arr));
    setSceneId(prev);
    setParams({ scene: prev }, { replace: true });
  };

  const scene = sceneData?.scene;
  const choices = useMemo(() => sceneData?.choices || [], [sceneData]);
  const ending = scene?.isEnding;
  const sceneTypeLabel = ending ? "Ending" : `Scene ${scene?.sceneOrder ?? ""}`;

  if (error) {
    return (
      <div className="cyp-page">
        <div className="cyp-container" style={{ padding: "90px 24px", textAlign: "center" }}>
          <h1>Could not open the story</h1>
          <p style={{ color: "var(--ink-soft)" }}>{error}</p>
          <Link className="cyp-btn cyp-btn-outline" to="/reader/library">Back to library</Link>
        </div>
      </div>
    );
  }

  if (story === undefined || !scene || loadingScene) {
    return (
      <div style={{ minHeight: "100vh", background: "#101418", display: "grid", placeItems: "center" }}>
        <LoadingSpinner onDark label="Illustrating the scene…" />
      </div>
    );
  }

  const totalScenes = story.sceneCount || 1;
  const pct = ending
    ? 100
    : Math.max(5, Math.min(95, Math.round(((scene.sceneOrder || 1) / totalScenes) * 90)));

  // The writer's saved description is the source of truth. Older per-style
  // image records may carry a stale description, so only use them as fallback.
  const description = scene.illustrationDescription?.trim() || sceneImage?.description?.trim() || scene.sceneDescription?.trim() || scene.narration;

  return (
    <div className="cyp-reader">
      {/* Full-screen illustration */}
      <div className="cyp-reader-art">
        <SceneIllustration description={description} style={style} seed={scene.sceneOrder * 13} />
      </div>

      {/* Top bar */}
      <div className="cyp-reader-top">
        <button type="button" className="cyp-btn cyp-btn-ghost cyp-btn-sm cyp-reader-back" onClick={() => navigate(`/reader/story/${storyId}`)} style={{ color: "#f5efe2" }}>
          ← {story.title}
        </button>
        <span className="cyp-reader-top-scene">{sceneTypeLabel}</span>
        <div className="cyp-progress" title={`${pct}% through`}>
          <div style={{ width: `${pct}%` }} />
        </div>
        <div className="cyp-reader-controls">
          <button type="button" className="cyp-btn cyp-btn-ghost cyp-btn-sm" style={{ color: "#f5efe2" }} onClick={goBack}>
            ⟲ Back
          </button>
          <button type="button" className="cyp-btn cyp-btn-ghost cyp-btn-sm" style={{ color: "#f5efe2" }} onClick={restart}>
            Restart
          </button>
        </div>
      </div>

      <div className="cyp-reader-spacer" />

      {/* Style selector */}
      <StyleSelector
        styles={styles}
        value={style}
        onChange={(name) => {
          setStyle(name);
          try {
            localStorage.setItem(`cyp_style_${storyId}`, name);
          } catch {
            /* private browsing — selection just won't persist */
          }
        }}
      />

      {/* Narration panel */}
      <div className="cyp-reader-panel">
        {saveError && (
          <div style={{ color: "#ffd9a0", fontSize: 12.5, marginBottom: 8 }}>{saveError}</div>
        )}
        <div className="cyp-narration">
          <div className="cyp-narration-scene-label">
            {ending ? "✦ Ending" : `✦ Scene ${scene.sceneOrder}`} · {pathInfo?.total ?? ""} paths
          </div>
          {ending ? (
            <div className="cyp-ending">
              <div className="cyp-ending-label">{scene.endingLabel || "The End"}</div>
              <h2>{scene.title}</h2>
              <p>{scene.narration}</p>
              <div className="cyp-ending-actions">
                <button type="button" className="cyp-btn cyp-btn-primary" onClick={restart}>
                  Walk another path
                </button>
                <Link className="cyp-btn cyp-btn-outline" style={{ color: "#f5efe2", borderColor: "rgba(245,239,226,0.4)" }} to={`/reader/story/${storyId}`}>
                  Story details
                </Link>
                <Link className="cyp-btn cyp-btn-outline" style={{ color: "#f5efe2", borderColor: "rgba(245,239,226,0.4)" }} to="/reader/library">
                  Library
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2>{scene.title}</h2>
              {scene.narration.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </>
          )}
        </div>

        {/* Choices */}
        {!ending && choices.length > 0 && (
          <div className="cyp-choices">
            {choices.map((c) => (
              <ChoiceButton
                key={c._id || c.id}
                choice={c}
                onSelect={choose}
                isNewPath={lastChoiceWasNew && c === choices[0]}
              />
            ))}
          </div>
        )}
        {!ending && choices.length === 0 && (
          <div className="cyp-narration" style={{ marginTop: 14 }}>
            <p style={{ marginBottom: 0 }}>This path is still being written…</p>
          </div>
        )}
      </div>
    </div>
  );
}
