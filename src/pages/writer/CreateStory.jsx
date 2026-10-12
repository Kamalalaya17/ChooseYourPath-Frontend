
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { STYLE_NAMES } from "../../services/styleDescriptions";
import * as storyService from "../../services/storyService";

const GENRES = [
  "Fantasy / Mystery",
  "Mystery / Fantasy",
  "Adventure / Fantasy",
  "Fantasy",
  "Mystery",
  "Adventure",
  "Horror",
  "Romance",
  "Fairy Tale",
  "Folklore",
  "Drama",
  "Science Fiction",
];

export default function CreateStory() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    genre: GENRES[0],
    theme: "",
    writingStyle: "",
    narrative: "",
    coverStyle: "Classic Storybook",
  });

  const [styles, setStyles] = useState([
    "Classic Storybook",
    "Watercolor",
    "Dark Forest",
    "Dreamlike",
  ]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const toggleStyle = (name) => {
    setStyles((current) =>
      current.includes(name)
        ? current.filter((style) => style !== name)
        : current.length >= 6
          ? current
          : [...current, name],
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setError(null);

    if (form.title.trim().length < 3) {
      setError("Title is required (at least 3 characters).");
      return;
    }

    if (form.description.trim().length < 10) {
      setError("Description is required (at least 10 characters).");
      return;
    }

    if (form.narrative.trim().length < 10) {
      setError("Narrative is required (at least 10 characters).");
      return;
    }

    if (styles.length < 2) {
      setError("Pick at least two visual styles.");
      return;
    }

    setBusy(true);

    try {
      const createdStory = await storyService.createStory({
        ...form,
        styles,
      });

      // The API may return an ID or a story object.
      const storyId =
        typeof createdStory === "string" ||
        typeof createdStory === "number"
          ? createdStory
          : createdStory?.id ??
            createdStory?.storyId ??
            createdStory?.data?.id ??
            createdStory?.data?.storyId;

      if (
        storyId == null ||
        String(storyId).trim() === "" ||
        String(storyId) === "[object Object]"
      ) {
        console.error("Unexpected createStory response:", createdStory);
        throw new Error(
          "The story response did not contain a usable story ID. Please check the browser console.",
        );
      }

      navigate(`/writer/edit/${encodeURIComponent(String(storyId))}`);
    } catch (err) {
      console.error("Create story failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not create the story. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cyp-page">
      <Navbar area="WRITER" />

      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Create a story</h1>
          <p>
            Start with the narrative. You'll add scenes, choices and endings
            next in the story builder. No artwork upload — every scene is
            illustrated from your scene descriptions.
          </p>
        </div>

        <div
          className="cyp-container"
          style={{ maxWidth: 720, paddingBottom: 60 }}
        >
          {error && (
            <div className="cyp-form-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="cyp-panel">
              <h3>The story</h3>
              <p className="cyp-panel-sub">Title, pitch and genre.</p>

              <div className="cyp-field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  className="cyp-input"
                  value={form.title}
                  onChange={set("title")}
                  placeholder="The Forgotten Door"
                  maxLength={120}
                  required
                />
              </div>

              <div className="cyp-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="cyp-textarea"
                  style={{ minHeight: 70 }}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="A young girl discovers a locked door beneath her grandmother's house…"
                  maxLength={2000}
                  required
                />
              </div>

              <div className="cyp-scene-grid">
                <div className="cyp-field">
                  <label htmlFor="genre">Genre</label>
                  <select
                    id="genre"
                    className="cyp-select"
                    value={form.genre}
                    onChange={set("genre")}
                  >
                    {GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cyp-field">
                  <label htmlFor="theme">Theme</label>
                  <input
                    id="theme"
                    className="cyp-input"
                    value={form.theme}
                    onChange={set("theme")}
                    placeholder="Courage vs. Fear"
                  />
                </div>
              </div>

              <div className="cyp-field">
                <label htmlFor="ws">Writing style</label>
                <input
                  id="ws"
                  className="cyp-input"
                  value={form.writingStyle}
                  onChange={set("writingStyle")}
                  placeholder="Dark but hopeful"
                />
              </div>

              <div className="cyp-field">
                <label htmlFor="narrative">Narrative</label>
                <textarea
                  id="narrative"
                  className="cyp-textarea"
                  style={{ minHeight: 120 }}
                  value={form.narrative}
                  onChange={set("narrative")}
                  placeholder="Describe the whole arc: who the character is, what pulls them forward, what stands in the way, and the truths the paths can reveal…"
                  required
                />
                <div className="cyp-field-hint">
                  This is the spine of your story. Scenes will realize it.
                </div>
              </div>
            </div>

            <div className="cyp-panel" style={{ marginTop: 16 }}>
              <h3>Visual styles</h3>
              <p className="cyp-panel-sub">
                Choose the art styles readers can switch between. Every scene
                is illustrated in each selected style.
              </p>

              <div className="cyp-path-chips" style={{ gap: 8 }}>
                {STYLE_NAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`cyp-style-chip${
                      styles.includes(name) ? " active" : ""
                    }`}
                    style={
                      styles.includes(name)
                        ? {}
                        : {
                            background: "#fff",
                            color: "var(--ink-soft)",
                            borderColor: "var(--line)",
                          }
                    }
                    onClick={() => toggleStyle(name)}
                    aria-pressed={styles.includes(name)}
                  >
                    {styles.includes(name) ? "✓ " : "+ "}
                    {name}
                  </button>
                ))}
              </div>

              <div className="cyp-field" style={{ marginTop: 16 }}>
                <label htmlFor="cover">Cover style</label>
                <select
                  id="cover"
                  className="cyp-select"
                  value={form.coverStyle}
                  onChange={set("coverStyle")}
                >
                  {styles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                className="cyp-btn cyp-btn-primary"
                type="submit"
                disabled={busy}
              >
                {busy ? "Creating…" : "Create story & open builder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
