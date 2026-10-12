/**
 * PerspectiveProgress — the reader's discovered narrative paths for a story.
 * Discovered paths are checked; undiscovered ones stay as invitations.
 */
export default function PerspectiveProgress({ paths, discovered, total, compact = false }) {
  if (!paths || paths.length === 0) {
    return <p className="cyp-list-sub">No paths recorded yet.</p>;
  }
  return (
    <div>
      {!compact && (
        <div className="cyp-progress-label">
          Perspectives discovered — {discovered ?? 0}/{total ?? paths.length}
        </div>
      )}
      <div className="cyp-path-chips">
        {paths.map((p) => (
          <span key={p.pathName} className={`cyp-path-chip${p.discovered ? " found" : ""}`}>
            {p.discovered ? "✓" : "○"} {p.pathName}
          </span>
        ))}
      </div>
    </div>
  );
}
