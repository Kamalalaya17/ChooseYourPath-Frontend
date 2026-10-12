import { Link } from "react-router-dom";
import SceneIllustration from "./SceneIllustration";

/**
 * StoryCard — catalog/library card with generated cover art, stats and
 * optional reading progress + discovered-path chips.
 */
export default function StoryCard({ story, progress, paths, cta = "Read story" }) {
  const meta = [
    story.genre,
    `${story.sceneCount || 0} scenes`,
    `${story.endingCount || 0} endings`,
  ].filter(Boolean).join(" • ");

  return (
    <Link to={`/reader/story/${story._id || story.id}`} className="cyp-card">
      <div className="cyp-card-art">
        <SceneIllustration
          description={story.description || story.narrative || story.title}
          style={story.coverStyle || "Classic Storybook"}
          seed={typeof story._id === "string" ? story._id.length * 17 : 42}
        />
        <span className="cyp-card-art-badge">{story.genre}</span>
      </div>
      <div className="cyp-card-body">
        <h3 className="cyp-card-title">{story.title}</h3>
        <p className="cyp-card-desc">{story.description}</p>
        <div className="cyp-card-meta">
          <span>{meta}</span>
        </div>

        {typeof progress?.progressPercentage === "number" && (
          <div>
            <div className="cyp-progress-label">Progress — {progress.progressPercentage}%</div>
            <div className="cyp-progress"><div style={{ width: `${progress.progressPercentage}%` }} /></div>
          </div>
        )}

        {paths && paths.total > 0 && (
          <div>
            <div className="cyp-progress-label">
              Perspectives discovered — {paths.discovered}/{paths.total}
            </div>
            <div className="cyp-path-chips">
              {paths.paths.slice(0, 4).map((p) => (
                <span key={p.pathName} className={`cyp-path-chip${p.discovered ? " found" : ""}`}>
                  {p.discovered ? "✓" : "○"} {p.pathName.replace(/^The /, "")}
                </span>
              ))}
              {paths.paths.length > 4 && (
                <span className="cyp-path-chip">+{paths.paths.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        <div className="cyp-card-foot">
          <span className="cyp-btn cyp-btn-primary cyp-btn-sm">
            {progress ? "Continue story" : cta}
          </span>
          <span className="cyp-card-meta">{story.authorName}</span>
        </div>
      </div>
    </Link>
  );
}
