// Authentication service.
// REST:  POST /api/reader/auth/register | /api/reader/auth/login
//        POST /api/writer/auth/register | /api/writer/auth/login
//        POST /api/admin/auth/login
// Convex: auth:register / auth:login / auth:me / auth:logout / auth:updateProfile
import api from "./api";
import { USE_REST } from "./config";
import convex from "./convexClient";

/** Friendly message from any backend error (never leak raw exceptions). */
export function authErrorMessage(e) {
  const data = e?.response?.data;
  if (data) {
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (parsed?.message) return parsed.message;
      } catch {
        /* fall through */
      }
      return data;
    }
    if (typeof data.message === "string") return data.message;
    // Spring validation errors come back as { field: message }
    const first = Object.values(data).find((v) => typeof v === "string");
    if (first) return first;
  }
  if (e instanceof Error && e.message) {
    if (e.message === "Network Error") return "Unable to connect to the server.";
    return e.message;
  }
  return "Something went wrong. Please try again.";
}

/** REST returns {token, username, role}; Convex returns {token, user}. Normalize to {token, user}. */
function normalizeAuth(res) {
  if (res && res.user) return res;
  if (res && res.token) {
    return {
      token: res.token,
      user: {
        id: res.id ?? res._id ?? undefined,
        _id: res._id ?? res.id ?? undefined,
        username: res.username,
        role: res.role,
        bio: res.bio,
      },
    };
  }
  throw new Error("Authentication failed.");
}

export async function register(username, password, confirmPassword, role) {
  let res;
  if (USE_REST) {
    const area = role.toLowerCase();
    const { data } = await api.post(`/api/${area}/auth/register`, {
      username,
      password,
      confirmPassword,
    });
    res = data;
  } else {
    res = await convex.mutation("auth:register", { username, password, confirmPassword, role });
  }
  return normalizeAuth(res);
}

export async function login(username, password, area) {
  let res;
  if (USE_REST) {
    const { data } = await api.post(`/api/${area.toLowerCase()}/auth/login`, { username, password });
    res = data;
  } else {
    res = await convex.mutation("auth:login", {
      username,
      password,
      area: area.toUpperCase(),
    });
  }
  return normalizeAuth(res);
}

export async function me(token) {
  if (USE_REST) {
    // The axios interceptor already carries the Bearer token.
    const { data } = await api.get("/api/auth/me");
    return data && data.username
      ? { _id: data.id, username: data.username, role: data.role || "READER", bio: data.bio }
      : null;
  }
  return convex.query("auth:me", { token });
}

export async function logout(token) {
  if (USE_REST) {
    await api.post("/api/auth/logout").catch(() => {});
    return;
  }
  if (token) await convex.mutation("auth:logout", { token });
}

export async function updateProfile(token, bio) {
  if (USE_REST) {
    await api.put("/api/auth/profile", { bio });
    return;
  }
  await convex.mutation("auth:updateProfile", { token, bio });
}
