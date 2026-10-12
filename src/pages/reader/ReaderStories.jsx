import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import StoryCard from "../../components/StoryCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as storyService from "../../services/storyService";
import { useAuth } from "../../context/AuthContext";

const GENRES = ["all", "Fantasy / Mystery", "Mystery / Fantasy", "Adventure / Fantasy", "Fantasy", "Mystery", "Adventure", "Horror", "Romance", "Fairy Tale", "Folklore", "Drama", "Science Fiction"];

// Themed dropdown for the genre filter only (native <select> popups cannot be styled).
// Closed state uses the same .cyp-select look; open menu is an absolutely-positioned
// dark panel so nothing on the page shifts. Mouse + full keyboard support.
function GenreSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  const label = (g) => (g === "all" ? "All genres" : g);
  const currentIndex = Math.max(0, GENRES.indexOf(value));

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector('[data-active="true"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openMenu = () => {
    setActive(currentIndex);
    setOpen(true);
  };

  const commit = (g) => {
    onChange(g);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(GENRES.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(GENRES.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(GENRES[active]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={"cyp-genre" + (open ? " cyp-open" : "")} ref={wrapRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        className="cyp-select cyp-genre-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={open ? `genre-opt-${active}` : undefined}
        aria-label="Filter by genre"
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <span>{label(value)}</span>
        <span className="cyp-genre-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul className="cyp-genre-menu" role="listbox" aria-label="Filter by genre" ref={listRef}>
          {GENRES.map((g, i) => (
            <li
              key={g}
              id={`genre-opt-${i}`}
              role="option"
              aria-selected={g === value}
              data-active={i === active ? "true" : "false"}
              className={
                "cyp-genre-option" + (i === active ? " cyp-active" : "") + (g === value ? " cyp-selected" : "")
              }
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(g)}
            >
              <span>{label(g)}</span>
              {g === value && (
                <span className="cyp-genre-check" aria-hidden="true">✓</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ReaderStories() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("newest");
  const [stories, setStories] = useState(null);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      storyService
        .listStories({ search: search || undefined, genre: genre !== "all" ? genre : undefined })
        .then((s) => {
          if (!alive) return;
          let list = s || [];
          if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
          if (sort === "oldest") list = [...list].sort((a, b) => a.createdAt - b.createdAt);
          setStories(list);
        })
        .catch(() => alive && setStories([]));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [search, genre, sort, token]);

  return (
    <div className="cyp-page">
      <Navbar area="READER" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Stories</h1>
          <p>The full catalog. Search by title, writer or keyword; filter by genre.</p>
        </div>
        <div className="cyp-container">
          <div className="cyp-toolbar">
            <input className="cyp-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <GenreSelect value={genre} onChange={setGenre} />
            <select className="cyp-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
          {!stories && <LoadingSpinner />}
          {stories && stories.length === 0 && <div className="cyp-empty">No stories match yet.</div>}
          <div className="cyp-grid">
            {(stories || []).map((s) => (
              <StoryCard key={s._id || s.id} story={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
