import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as adminService from "../../services/adminService";

export default function ManageComments() {
  const [comments, setComments] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    adminService
      .listComments()
      .then((c) => setComments(c || []))
      .catch((e) => setError(e?.message || "Could not load comments."));
  };

  useEffect(load, []);

  return (
    <div className="cyp-page">
      <Navbar area="ADMIN" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Comments</h1>
          <p>Moderate reader discussion across all stories.</p>
        </div>
        <div className="cyp-container">
          {error && <div className="cyp-form-error">{error}</div>}
          {!comments && !error && <LoadingSpinner />}
          {comments && comments.length === 0 && <div className="cyp-empty">No comments to moderate.</div>}
          <div className="cyp-list">
            {(comments || []).map((c) => (
              <div key={c._id || c.id} className="cyp-list-row">
                <div className="cyp-list-main">
                  <div className="cyp-list-title">{c.authorName}</div>
                  <div className="cyp-list-sub" style={{ whiteSpace: "normal" }}>{c.commentText}</div>
                  <div className="cyp-list-sub">{new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <button
                  type="button"
                  className="cyp-btn cyp-btn-danger cyp-btn-sm"
                  onClick={async () => {
                    await adminService.deleteComment(c._id || c.id).catch(() => {});
                    load();
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
