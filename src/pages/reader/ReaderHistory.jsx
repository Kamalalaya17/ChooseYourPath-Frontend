import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProgressBar from "../../components/ProgressBar";
import * as readerService from "../../services/readerService";

export default function ReaderHistory() {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    let alive = true;
    readerService
      .readingHistory()
      .then((h) => alive && setHistory(h || []))
      .catch(() => alive && setHistory([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="cyp-page">
      <Navbar area="READER" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Reading history</h1>
          <p>Every story you've opened, most recent first.</p>
        </div>
        <div className="cyp-container">
          {!history && <LoadingSpinner />}
          {history && history.length === 0 && (
            <div className="cyp-empty">No reading history yet — start a story and it will appear here.</div>
          )}
          <div className="cyp-list">
            {(history || []).map((h) => (
              <Link key={h.storyId || h.id} to={`/reader/read/${h.storyId || h.id}`} className="cyp-list-row">
                <div className="cyp-list-main">
                  <div className="cyp-list-title">{h.title}</div>
                  <div className="cyp-list-sub">
                    {h.genre} — last read {new Date(h.updatedAt).toLocaleDateString()}
                  </div>
                  <div style={{ maxWidth: 320, marginTop: 8 }}>
                    <ProgressBar value={h.progressPercentage} />
                  </div>
                </div>
                <span className="cyp-btn cyp-btn-outline cyp-btn-sm">
                  {h.progressPercentage >= 100 ? "Read again" : "Continue"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
