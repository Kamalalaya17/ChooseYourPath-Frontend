import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import * as readerService from "../../services/readerService";

export default function ReaderProfile() {
  const { user, updateBio } = useAuth();
  const [bio, setBio] = useState(user?.bio || "");
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState(null);
  const [favorites, setFavorites] = useState(null);

  useEffect(() => {
    let alive = true;
    readerService.readingHistory().then((h) => alive && setHistory(h || [])).catch(() => alive && setHistory([]));
    readerService.myFavorites().then((f) => alive && setFavorites(f || [])).catch(() => alive && setFavorites([]));
    return () => {
      alive = false;
    };
  }, []);

  const save = async (e) => {
    e.preventDefault();
    await updateBio(bio);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="cyp-page">
      <Navbar area="READER" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Profile</h1>
          <p>Your reader identity on ChooseYourPath.</p>
        </div>
        <div className="cyp-container" style={{ maxWidth: 640, display: "grid", gap: 18 }}>
          <div className="cyp-stat-grid" style={{ marginBottom: 0 }}>
            <div className="cyp-stat">
              <b>{history ? history.length : "…"}</b>
              <span>stories opened</span>
            </div>
            <div className="cyp-stat">
              <b>{history ? history.filter((h) => h.progressPercentage >= 100).length : "…"}</b>
              <span>endings reached</span>
            </div>
            <div className="cyp-stat">
              <b>{favorites ? favorites.length : "…"}</b>
              <span>favorites</span>
            </div>
          </div>

          <div className="cyp-panel">
            <h3>{user?.username}</h3>
            <p className="cyp-panel-sub">Reader · member of ChooseYourPath</p>
            <form onSubmit={save}>
              <div className="cyp-field">
                <label htmlFor="bio">About you</label>
                <textarea
                  id="bio"
                  className="cyp-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What kind of paths do you like to walk?"
                  maxLength={500}
                />
              </div>
              {saved && <div className="cyp-form-ok">Profile saved.</div>}
              <button className="cyp-btn cyp-btn-primary" type="submit">Save profile</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
