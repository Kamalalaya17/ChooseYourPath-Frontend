export default function LoadingSpinner({ label = "Loading…", onDark = false }) {
  return (
    <div className="cyp-loading" style={onDark ? { color: "rgba(245,239,226,0.7)" } : undefined}>
      <span className={`cyp-spinner${onDark ? " on-dark" : ""}`} />
      {label}
    </div>
  );
}
