import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

export default function WriterProfile() {
  const { user, updateBio } = useAuth();
  const [bio, setBio] = useState(user?.bio || "");
  const [saved, setSaved] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    await updateBio(bio);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="cyp-page">
      <Navbar area="WRITER" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Profile</h1>
          <p>Your writer identity on ChooseYourPath.</p>
        </div>
        <div className="cyp-container" style={{ maxWidth: 640 }}>
          <div className="cyp-panel">
            <h3>{user?.username}</h3>
            <p className="cyp-panel-sub">Writer</p>
            <form onSubmit={save}>
              <div className="cyp-field">
                <label htmlFor="bio">About you</label>
                <textarea
                  id="bio"
                  className="cyp-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What kinds of worlds do you build?"
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
