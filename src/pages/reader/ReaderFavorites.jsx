import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StoryCard from "../../components/StoryCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as readerService from "../../services/readerService";

export default function ReaderFavorites() {
  const [favorites, setFavorites] = useState(null);

  useEffect(() => {
    let alive = true;
    readerService
      .myFavorites()
      .then((f) => alive && setFavorites(f || []))
      .catch(() => alive && setFavorites([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="cyp-page">
      <Navbar area="READER" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Favorites</h1>
          <p>The stories you've saved for another pass through the paths.</p>
        </div>
        <div className="cyp-container">
          {!favorites && <LoadingSpinner />}
          {favorites && favorites.length === 0 && (
            <div className="cyp-empty">
              No favorites yet — tap the bookmark on any story page to keep it close.
            </div>
          )}
          <div className="cyp-grid">
            {(favorites || []).map((s) => (
              <StoryCard key={s._id || s.id} story={s} cta="Read again" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
