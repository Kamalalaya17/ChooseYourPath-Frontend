/**
 * StyleSelector — lets the reader switch the scene's art style at any time.
 * Only the illustration changes; the story text and structure stay identical.
 */
export default function StyleSelector({ styles, value, onChange }) {
  if (!styles || styles.length === 0) return null;
  return (
    <div className="cyp-style-bar">
      <span className="cyp-style-label">Visual style</span>
      {styles.map((s) => {
        const name = typeof s === "string" ? s : s.styleName;
        return (
          <button
            key={name}
            type="button"
            className={`cyp-style-chip${value === name ? " active" : ""}`}
            onClick={() => onChange(name)}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
