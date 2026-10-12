export default function ProgressBar({ value }) {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="cyp-progress">
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}
