import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";
import * as adminService from "../../services/adminService";

export default function ManageUsers({ initialTab = "READER" }) {
  const [tab, setTab] = useState(initialTab);
  const [users, setUsers] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    setUsers(null);
    adminService
      .listUsers(tab)
      .then((u) => { setUsers(u || []); setError(null); })
      .catch((e) => {
        setUsers([]);
        setError(e?.response?.data?.message || e?.message || "Could not load users.");
      });
  };

  useEffect(load, [tab]);

  return (
    <div className="cyp-page">
      <Navbar area="ADMIN" />
      <div className="cyp-page-body">
        <div className="cyp-container cyp-page-head">
          <h1>{tab === "READER" ? "Readers" : "Writers"}</h1>
          <p>
            {tab === "READER"
              ? "Everyone who reads and discovers paths."
              : "Everyone who builds stories on the platform."}
          </p>
        </div>
        <div className="cyp-container">
          <div className="cyp-tabs">
            <button type="button" className={`cyp-tab${tab === "READER" ? " active" : ""}`} onClick={() => setTab("READER")}>
              Readers
            </button>
            <button type="button" className={`cyp-tab${tab === "WRITER" ? " active" : ""}`} onClick={() => setTab("WRITER")}>
              Writers
            </button>
          </div>

          {error && <div className="cyp-form-error">{error}</div>}
          {!users && !error && <LoadingSpinner />}
          {users && users.length === 0 && <div className="cyp-empty">No accounts in this section.</div>}

          {users && users.length > 0 && (
            <div className="cyp-table-wrap">
              <table className="cyp-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id || u.id}>
                      <td>
                        <b>{u.username}</b>
                        {u.bio && <div className="cyp-list-sub">{u.bio}</div>}
                      </td>
                      <td><span className={`cyp-badge cyp-badge-${u.role}`}>{u.role}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {u.role !== "ADMIN" && (
                            <select
                              className="cyp-select"
                              style={{ width: "auto", padding: "6px 9px" }}
                              value={u.role}
                              onChange={async (e) => {
                                try {
                                  await adminService.setRole(u._id || u.id, e.target.value);
                                  load();
                                } catch (err) {
                                  setError(err?.message || "Could not change role.");
                                }
                              }}
                            >
                              <option value="READER">READER</option>
                              <option value="WRITER">WRITER</option>
                            </select>
                          )}
                          {u.role !== "ADMIN" && (
                            <button type="button" className="cyp-btn cyp-btn-danger cyp-btn-sm" onClick={() => setToDelete(u)}>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toDelete && (
        <Modal
          title={`Delete ${toDelete.username}?`}
          subtitle="This removes the account and its stories, progress and comments. This cannot be undone."
          onClose={() => setToDelete(null)}
          actions={
            <>
              <button type="button" className="cyp-btn cyp-btn-outline" onClick={() => setToDelete(null)}>Cancel</button>
              <button
                type="button"
                className="cyp-btn cyp-btn-primary"
                onClick={async () => {
                  try {
                    await adminService.deleteUser(toDelete._id || toDelete.id);
                    setToDelete(null);
                    load();
                  } catch (err) {
                    setError(err?.message || "Could not delete the account.");
                    setToDelete(null);
                  }
                }}
              >
                Delete account
              </button>
            </>
          }
        >
          <span />
        </Modal>
      )}
    </div>
  );
}
