import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StoryCard from "../../components/StoryCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as storyService from "../../services/storyService";

const GENRES = [
  "all", "Fantasy / Mystery", "Mystery / Fantasy", "Adventure / Fantasy",
  "Fantasy", "Mystery", "Adventure", "Horror", "Romance",
  "Fairy Tale", "Folklore", "Drama", "Science Fiction",
];

export default function ReaderBrowse() {
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
          if (sort === "newest") list = [...list].sort((a, b) => b.createdAt - a.createdAt);
          setStories(list);
        })
        .catch(() => alive && setStories([]));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [search, genre, sort]);

  return (
    <div className="cyp-page">
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1>Explore stories</h1>
              <p>Search by title, writer or keyword — filter by genre — sort to taste.</p>
            </div>
            <Link className="cyp-btn cyp-btn-outline cyp-btn-sm" to="/">
              ← Home
            </Link>
          </div>
        </div>

        <div className="cyp-container">
          <div className="cyp-toolbar">
            <input
              className="cyp-input"
              placeholder="Search stories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="cyp-select" value={genre} onChange={(e) => setGenre(e.target.value)}>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g === "all" ? "All genres" : g}
                </option>
              ))}
            </select>
            <select className="cyp-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>

          {!stories && <LoadingSpinner />}
          {stories && stories.length === 0 && (
            <div className="cyp-empty">No stories match your search yet. Try another term or genre.</div>
          )}
          <div className="cyp-grid">
            {(stories || []).map((s) => (
              <StoryCard key={s._id || s.id} story={s} cta="Read story" />
            ))}
          </div>
        </div>
      </div>
      <footer className="cyp-footer">
        <div className="cyp-container cyp-footer-inner">
          <span>◇ ChooseYourPath</span>
          <span>Every choice creates a different story.</span>
        </div>
      </footer>
    </div>
  );
}
