import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { authErrorMessage } from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "cyp_token";
const USER_KEY = "cyp_user";

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Revalidate the stored session on mount. The Convex REST token may have
  // expired; a network failure must NOT log the user out — only a definite
  // "session gone" (null) response does.
  useEffect(() => {
    let alive = true;
    if (!token) return;
    authService
      .me(token)
      .then((u) => {
        if (!alive) return;
        if (!u) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setTokenState(null);
          setUser(null);
        } else {
          setUser(u);
          localStorage.setItem(USER_KEY, JSON.stringify(u));
        }
      })
      .catch(() => {
        /* offline / backend restarting — keep the stored session */
      });
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (area, username, password) => {
    setLoading(true);
    setError(null);
    try {
      const { token: t, user: u } = await authService.login(username, password, area);
      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      setTokenState(t);
      setUser(u);
      return u;
    } catch (e) {
      setError(authErrorMessage(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (area, username, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    // Client-side validation mirroring the backend contract.
    const name = (username || "").trim();
    if (name.length < 3) {
      setError("Username must be at least 3 characters.");
      return null;
    }
    if (name.length > 30) {
      setError("Username must be at most 30 characters.");
      return null;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError("Username may only contain letters, numbers and underscores.");
      return null;
    }
    if ((password || "").length < 6) {
      setError("Password must be at least 6 characters.");
      return null;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return null;
    }
    try {
      const role = area.toUpperCase();
      const { token: t, user: u } = await authService.register(name, password, confirmPassword, role);
      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      setTokenState(t);
      setUser(u);
      setError(null);
      setNotice("Account created successfully. Welcome to ChooseYourPath!");
      return u;
    } catch (e) {
      setError(authErrorMessage(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await authService.logout(token);
    } catch {
      // best-effort
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setTokenState(null);
    setUser(null);
    setNotice(null);
    setError(null);
  }, [token]);

  const updateBio = useCallback(
    async (bio) => {
      await authService.updateProfile(token, bio);
      const next = { ...user, bio };
      setUser(next);
      localStorage.setItem(USER_KEY, JSON.stringify(next));
    },
    [token, user],
  );

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      loading,
      error,
      notice,
      setError,
      setNotice,
      login,
      signup,
      logout,
      updateBio,
    }),
    [token, user, loading, error, notice, login, signup, logout, updateBio],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
