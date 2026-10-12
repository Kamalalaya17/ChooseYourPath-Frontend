import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";
import * as storyService from "../../services/storyService";

export default function StoryBuilder() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(undefined);
  const [scenes, setScenes] = useState([]);
  const [choicesByScene, setChoicesByScene] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const [s, sc] = await Promise.all([storyService.getStory(storyId), storyService.getScenes(storyId)]);
      setStory(s);
      setScenes(sc || []);
      const map = {};
      await Promise.all(
        (sc || []).map(async (scene) => {
          const sd = await storyService.getScene(scene._id || scene.id).catch(() => null);
          map[scene._id || scene.id] = sd?.choices || [];
        }),
      );
      setChoicesByScene(map);
    } catch (e) {
      setError(e?.message || "Could not load the builder.");
      setStory(null);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  if (error) {
    return (
      <div className="cyp-page">
        <Navbar area="WRITER" />
        <div className="cyp-container" style={{ padding: "80px 24px" }}>
          <div className="cyp-form-error">{error}</div>
          <Link className="cyp-btn cyp-btn-outline" to="/writer/stories">Back to my stories</Link>
        </div>
      </div>
    );
  }
  if (story === undefined) {
    return (
      <div className="cyp-page">
        <Navbar area="WRITER" />
        <LoadingSpinner label="Opening the builder…" />
      </div>
    );
  }
  if (!story) {
    return (
      <div className="cyp-page">
        <Navbar area="WRITER" />
        <div className="cyp-container" style={{ padding: "80px 24px", textAlign: "center" }}>
          <h1>Story not found</h1>
          <p style={{ color: "var(--ink-soft)" }}>It may have been deleted.</p>
          <Link className="cyp-btn cyp-btn-outline" to="/writer/stories">Back to my stories</Link>
        </div>
      </div>
    );
  }

  const byId = Object.fromEntries(scenes.map((s) => [s._id || s.id, s]));
  const choicesFor = (sceneId) => choicesByScene[sceneId] || [];

  const addScene = async () => {
    try {
      const id = await storyService.createScene(storyId, {
        title: `Scene ${scenes.length + 1}`,
        narration: "Describe what happens in this scene.",
        sceneDescription: "",
        illustrationDescription: "",
        isEnding: false,
      });
      await load();
      setExpanded(id);
    } catch (e) {
      setError(e?.message || "Could not add the scene.");
    }
  };

  return (
    <div className="cyp-page">
      <Navbar area="WRITER" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 14 }}>
          <div>
            <Link to="/writer/stories" className="cyp-list-sub" style={{ display: "inline-block", marginBottom: 6 }}>
              ← My stories
            </Link>
            <h1>{story.title}</h1>
            <p>
              {story.genre} · {scenes.length} scenes ·{" "}
              {scenes.filter((s) => s.isEnding).length} endings · status {story.status}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="cyp-btn cyp-btn-primary" onClick={addScene}>
              + Add scene
            </button>
            <Link className="cyp-btn cyp-btn-outline" to={`/reader/story/${storyId}`}>
              Preview
            </Link>
          </div>
        </div>

        <div className="cyp-container" style={{ paddingBottom: 70 }}>
          {/* Structure map */}
          <div className="cyp-builder-map" style={{ marginBottom: 18 }}>
            <div style={{ color: "#c9a24b", fontWeight: 700, letterSpacing: "0.1em", fontSize: 11, marginBottom: 8 }}>
              STRUCTURE
            </div>
            {scenes.map((s) => {
              const id = s._id || s.id;
              const chs = choicesFor(id);
              return (
                <div key={id} className="cyp-builder-map-row">
                  <span
                    className={`cyp-builder-map-node${s.isEnding ? " ending" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setExpanded(id)}
                  >
                    {s.sceneOrder}. {s.title}
                  </span>
                  {chs.map((c, i) => {
                    const next = c.nextSceneId ? byId[c.nextSceneId] : null;
                    return (
                      <span key={c._id || c.id} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <span className="cyp-builder-map-arrow">{i === 0 ? "→" : "·"}</span>
                        <span className="cyp-builder-map-node" style={{ opacity: 0.8 }} title={c.consequence}>
                          {c.pathName}
                          {next ? ` → ${next.sceneOrder}. ${next.title}` : " → ⚠ unlinked"}
                        </span>
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Scene cards */}
          <div className="cyp-builder">
            {scenes.map((s) => {
              const id = s._id || s.id;
              return (
                <SceneEditor
                  key={id}
                  scene={s}
                  choices={choicesFor(id)}
                  scenes={scenes}
                  expanded={expanded === id}
                  onToggle={() => setExpanded(expanded === id ? null : id)}
                  onChanged={load}
                  onError={setError}
                  storyId={storyId}
                  navigate={navigate}
                />
              );
            })}
          </div>

          {scenes.length === 0 && (
            <div className="cyp-empty" style={{ marginTop: 8 }}>
              No scenes yet — add the first scene to begin realizing your narrative.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SceneEditor({ scene, choices, scenes, expanded, onToggle, onChanged, onError, storyId, navigate }) {
  const id = scene._id || scene.id;
  const [title, setTitle] = useState(scene.title);
  const [narration, setNarration] = useState(scene.narration);
  const [sceneDescription, setSceneDescription] = useState(scene.sceneDescription || "");
  const [illustrationDescription, setIllustrationDescription] = useState(scene.illustrationDescription || "");
  const [isEnding, setIsEnding] = useState(scene.isEnding);
  const [endingLabel, setEndingLabel] = useState(scene.endingLabel || "");
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // new-choice form
  const [cText, setCText] = useState("");
  const [cPath, setCPath] = useState("");
  const [cNext, setCNext] = useState("");
  const [cCons, setCCons] = useState("");

  useEffect(() => {
    setTitle(scene.title);
    setNarration(scene.narration);
    setSceneDescription(scene.sceneDescription || "");
    setIllustrationDescription(scene.illustrationDescription || "");
    setIsEnding(scene.isEnding);
    setEndingLabel(scene.endingLabel || "");
  }, [scene]);

  const save = async () => {
    setBusy(true);
    setSaveStatus("");
    try {
      const payload = {
        title: title.trim(),
        narration: narration.trim(),
        sceneDescription: sceneDescription.trim(),
        illustrationDescription: illustrationDescription.trim(),
        isEnding,
        endingLabel: endingLabel.trim(),
      };
      await storyService.updateScene(id, payload);
      // Read the record back so the UI never reports success for a field that
      // the active backend failed to persist.
      const persistedScenes = await storyService.getScenes(storyId);
      const persisted = (persistedScenes || []).find(
        (item) => String(item._id || item.id) === String(id),
      );
      if (!persisted || (persisted.sceneDescription || "") !== payload.sceneDescription || (persisted.illustrationDescription || "") !== payload.illustrationDescription) {
        throw new Error("Scene description could not be verified after saving. Please try again.");
      }
      setTitle(payload.title);
      setNarration(payload.narration);
      setSceneDescription(payload.sceneDescription);
      setIllustrationDescription(payload.illustrationDescription);
      setSaveStatus("Scene, narration, and illustration description saved.");
      await onChanged();
    } catch (e) {
      setSaveStatus("");
      onError(e?.message || "Could not save the scene.");
    } finally {
      setBusy(false);
    }
  };

  const removeScene = async () => {
    if (!window.confirm(`Delete scene ${scene.sceneOrder}: "${scene.title}"? Its choices will be removed too.`)) return;
    setBusy(true);
    try {
      await storyService.deleteScene(id);
      onChanged();
    } catch (e) {
      onError(e?.message || "Could not delete the scene.");
    } finally {
      setBusy(false);
    }
  };

  const addChoice = async (e) => {
    e.preventDefault();
    if (!cText.trim()) return;
    if (!cNext) {
      onError("Pick the next scene this choice leads to.");
      return;
    }
    try {
      await storyService.createChoice(id, {
        choiceText: cText,
        nextSceneId: cNext,
        pathName: cPath,
        consequence: cCons,
      });
      setCText("");
      setCPath("");
      setCNext("");
      setCCons("");
      onChanged();
    } catch (err) {
      onError(err?.message || "Could not add the choice.");
    }
  };

  const nonEndingScenes = scenes.filter((s) => !(s._id || s.id) !== !!(scene._id || scene.id)); // all scenes
  const selectable = scenes;

  return (
    <div className="cyp-scene-card">
      <div className="cyp-scene-head" onClick={onToggle} role="button" tabIndex={0}>
        <span className="cyp-scene-num">{scene.sceneOrder}</span>
        <span className="cyp-scene-title">
          {scene.title}
          {scene.isEnding && <span className="cyp-badge cyp-badge-PENDING" style={{ marginLeft: 8 }}>ending</span>}
        </span>
        <span className="cyp-list-sub">{choices.length} choice{choices.length === 1 ? "" : "s"}</span>
        <span style={{ color: "var(--ink-faint)" }}>{expanded ? "▴" : "▾"}</span>
      </div>

      {expanded && (
        <div className="cyp-scene-body">
          <div className="cyp-scene-grid">
            <div className="cyp-field">
              <label>Scene title</label>
              <input className="cyp-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="cyp-field">
              <label>Ending scene</label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 500 }}>
                <input type="checkbox" checked={isEnding} onChange={(e) => setIsEnding(e.target.checked)} />
                <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
                  This scene is an ending
                </span>
              </label>
              {isEnding && (
                <input
                  className="cyp-input"
                  style={{ marginTop: 8 }}
                  value={endingLabel}
                  onChange={(e) => setEndingLabel(e.target.value)}
                  placeholder="Ending label, e.g. THE NEW KEEPER"
                />
              )}
            </div>
          </div>

          <div className="cyp-field">
            <label>Narration</label>
            <textarea className="cyp-textarea" style={{ minHeight: 110 }} value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="What happens in this scene…" />
          </div>

          <div className="cyp-field">
            <label>Scene description</label>
            <textarea className="cyp-textarea" style={{ minHeight: 80 }} value={sceneDescription} onChange={(e) => setSceneDescription(e.target.value)} placeholder="Describe the scene, its setting, atmosphere, and important details…" />
          </div>

          <div className="cyp-field">
            <label>Illustration description</label>
            <textarea className="cyp-textarea" style={{ minHeight: 60 }} value={illustrationDescription} onChange={(e) => setIllustrationDescription(e.target.value)} placeholder="Describe what the illustration should show: characters, objects, colors, and composition…" />
            <div className="cyp-field-hint">
              The reader uses this text to choose and vary a built-in SVG illustration; it does not create a photorealistic or AI-generated image.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button type="button" className="cyp-btn cyp-btn-primary cyp-btn-sm" onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save scene"}
            </button>
            {scene.sceneOrder > 1 && (
              <button type="button" className="cyp-btn cyp-btn-danger cyp-btn-sm" onClick={removeScene} disabled={busy}>
                Delete scene
              </button>
            )}
          </div>
          {saveStatus && (
            <p role="status" aria-live="polite" style={{ color: "var(--success, #32c99a)", fontSize: 13, margin: "-8px 0 16px" }}>
              {saveStatus}
            </p>
          )}

          {/* Choices */}
          <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>Choices</h3>
          {choices.map((c) => (
            <ChoiceEditor key={c._id || c.id} choice={c} scenes={selectable} onChanged={onChanged} onError={onError} />
          ))}
          {choices.length === 0 && !isEnding && (
            <div className="cyp-list-sub" style={{ marginBottom: 10 }}>
              No choices yet — readers would be stuck here. Add at least one.
            </div>
          )}
          {isEnding && choices.length === 0 && (
            <div className="cyp-list-sub" style={{ marginBottom: 10 }}>
              Endings have no outgoing choices.
            </div>
          )}

          {!isEnding && (
            <form onSubmit={addChoice} className="cyp-choice-row" style={{ background: "#fff" }}>
              <div className="cyp-choice-grid">
                <input className="cyp-input" placeholder="Choice text, e.g. Open the door" value={cText} onChange={(e) => setCText(e.target.value)} />
                <input className="cyp-input" placeholder="Path name, e.g. The Curious Path" value={cPath} onChange={(e) => setCPath(e.target.value)} />
                <select className="cyp-select" value={cNext} onChange={(e) => setCNext(e.target.value)}>
                  <option value="">Next scene…</option>
                  {selectable.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.sceneOrder}. {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <input className="cyp-input" style={{ marginTop: 9 }} placeholder="Consequence — what happens because of this choice" value={cCons} onChange={(e) => setCCons(e.target.value)} />
                <div style={{ marginTop: 10 }}>
                <button
                  className="cyp-btn cyp-btn-primary cyp-btn-sm"
                  type="submit"
                  disabled={!cText.trim() || !cNext}
                >
                  + Add choice
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function ChoiceEditor({ choice, scenes, onChanged, onError }) {
  const id = choice._id || choice.id;
  const [text, setText] = useState(choice.choiceText);
  const [path, setPath] = useState(choice.pathName);
  const [next, setNext] = useState(choice.nextSceneId || "");
  const [cons, setCons] = useState(choice.consequence || "");

  useEffect(() => {
    setText(choice.choiceText);
    setPath(choice.pathName);
    setNext(choice.nextSceneId || "");
    setCons(choice.consequence || "");
  }, [choice]);

  const save = async () => {
    try {
      await storyService.updateChoice(id, { choiceText: text, pathName: path, nextSceneId: next, consequence: cons });
      onChanged();
    } catch (e) {
      onError(e?.message || "Could not save the choice.");
    }
  };

  return (
    <div className="cyp-choice-row">
      <div className="cyp-choice-grid">
        <input className="cyp-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Choice text" />
        <input className="cyp-input" value={path} onChange={(e) => setPath(e.target.value)} placeholder="Path name" />
        <select className="cyp-select" value={next} onChange={(e) => setNext(e.target.value)}>
          <option value="">Next scene…</option>
          {scenes.map((s) => (
            <option key={s._id || s.id} value={s._id || s.id}>
              {s.sceneOrder}. {s.title}
            </option>
          ))}
        </select>
      </div>
      <input className="cyp-input" value={cons} onChange={(e) => setCons(e.target.value)} placeholder="Consequence" />
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button type="button" className="cyp-btn cyp-btn-outline cyp-btn-sm" onClick={save}>
          Save choice
        </button>
        <button
          type="button"
          className="cyp-btn cyp-btn-danger cyp-btn-sm"
          onClick={async () => {
            await storyService.deleteChoice(id).catch(() => {});
            onChanged();
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
