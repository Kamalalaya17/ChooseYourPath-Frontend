import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

export default function AdminSettings() {
  const { logout } = useAuth();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="cyp-page">
      <Navbar area="ADMIN" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>Settings</h1>
          <p>Platform configuration and session controls.</p>
        </div>
        <div className="cyp-container" style={{ maxWidth: 640 }}>
          <div className="cyp-panel" style={{ marginBottom: 16 }}>
            <h3>Platform</h3>
            <p className="cyp-panel-sub">
              ChooseYourPath runs on a React + Spring Boot + MySQL stack with JWT authentication
              and three separated areas (READER, WRITER, ADMIN). Admin accounts exist only via
              the database/seed — there is no admin signup.
            </p>
            <ul style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.9, margin: "8px 0 0", paddingLeft: 18 }}>
              <li>Username + password authentication with BCrypt hashing</li>
              <li>Role-based access: READER / WRITER / ADMIN</li>
              <li>Story publication requires admin approval</li>
              <li>No AI services, no artwork uploads — illustrations are generated locally from scene descriptions</li>
            </ul>
          </div>
          <div className="cyp-panel">
            <h3>Session</h3>
            <p className="cyp-panel-sub">End your admin session on this device.</p>
            {!confirm ? (
              <button type="button" className="cyp-btn cyp-btn-outline" onClick={() => setConfirm(true)}>
                Sign out
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="cyp-btn cyp-btn-outline" onClick={() => setConfirm(false)}>
                  Cancel
                </button>
                <button type="button" className="cyp-btn cyp-btn-primary" onClick={logout}>
                  Confirm sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
