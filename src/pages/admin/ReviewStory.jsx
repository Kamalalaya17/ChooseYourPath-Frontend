import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import * as adminService from "../../services/adminService";

export default function ReviewStory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    adminService.getStoryForReview(id)
      .then((result) => { if (active) setData(result); })
      .catch((e) => {
        if (active) setError(e?.response?.data?.message || e?.message || "Could not load this story.");
      });
    return () => { active = false; };
  }, [id]);

  async function moderate(action) {
    setBusy(true);
    setError("");
    try {
      if (action === "approve") await adminService.approveStory(id);
      else await adminService.rejectStory(id);
      navigate("/admin/stories", { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "The moderation action failed.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) return (
    <div className="cyp-page"><Navbar area="ADMIN" /><main className="cyp-page-body"><div className="cyp-container"><p className="cyp-form-error">{error}</p><Link to="/admin/stories">Back to stories</Link></div></main></div>
  );
  if (!data) return <div className="cyp-page"><Navbar area="ADMIN" /><main className="cyp-page-body"><LoadingSpinner /></main></div>;

  const story = data.story || {};
  const scenes = data.scenes || [];

  return (
    <div className="cyp-page">
      <Navbar area="ADMIN" />
      <main className="cyp-page-body">
        <div className="cyp-container">
          <Link to="/admin/stories">← Back to stories</Link>
          <header className="cyp-page-head">
            <h1>{story.title || "Story review"}</h1>
            <p>By {story.authorName || "Unknown author"} · {story.genre || "Uncategorised"} · {story.status || "Unknown status"}</p>
          </header>

          <section className="cyp-panel cyp-review-panel">
            <h2>Story details</h2>
            <h3>Description</h3>
            <p>{story.description || "No description provided."}</p>
            <h3>Theme</h3>
            <p>{story.theme || "Not specified."}</p>
            <h3>Writing style</h3>
            <p>{story.writingStyle || "Not specified."}</p>
            <h3>Full story narrative</h3>
            <p className="cyp-review-narrative">{story.narrative || "No narrative provided."}</p>
            <p>{scenes.length} scenes · {story.endingCount ?? scenes.filter((x) => x.scene?.isEnding).length} endings · {story.reads ?? 0} opens</p>
          </section>

          <section className="cyp-review-scenes">
            <h2>Scenes and choices</h2>
            {scenes.length === 0 ? <div className="cyp-empty">No scenes were found for this story.</div> : scenes.map((item, index) => {
              const scene = item.scene || {};
              const choices = item.choices || [];
              return (
                <article className="cyp-panel cyp-review-panel" key={scene.id ?? index}>
                  <h3>Scene {scene.sceneOrder ?? index + 1}: {scene.title || "Untitled scene"}</h3>
                  {scene.isEnding && <p className="cyp-review-ending"><strong>This scene is an ending</strong>{scene.endingLabel ? ` — ${scene.endingLabel}` : ""}</p>}
                  <h4>Narration</h4><p className="cyp-review-narrative">{scene.narration || "No narration provided."}</p>
                  <h4>Scene / illustration description</h4><p>{scene.sceneDescription || "No scene or illustration description provided."}</p>
                  <h4>Choices</h4>
                  {choices.length === 0 ? <p>{scene.isEnding ? "This ending has no outgoing choices." : "No choices attached to this scene."}</p> : <ul className="cyp-review-choices">{choices.map((choice) => (
                    <li key={choice.id}>
                      <strong>{choice.choiceText}</strong>
                      {choice.pathName && <p>Path: {choice.pathName}</p>}
                      {choice.consequence && <p>Consequence: {choice.consequence}</p>}
                      <p>Next scene ID: {choice.nextSceneId ?? "Not specified"}</p>
                    </li>
                  ))}</ul>}
                </article>
              );
            })}
          </section>
          {error && <div className="cyp-form-error">{error}</div>}
          {story.status === "PENDING" && (
            <div className="cyp-list-actions cyp-review-actions">
              <button type="button" className="cyp-btn cyp-btn-primary" disabled={busy} onClick={() => moderate("approve")}>{busy ? "Processing…" : "Approve story"}</button>
              <button type="button" className="cyp-btn cyp-btn-outline" disabled={busy} onClick={() => moderate("reject")}>Reject story</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
