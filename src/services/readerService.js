// Reader services — REST endpoints documented above each function.
// GET  /api/reader/progress                   (history)
// GET  /api/reader/progress/{storyId}         (one story's progress)
// POST /api/reader/progress                   { storyId, sceneId }
// GET/POST /api/reader/stories/{storyId}/paths
// GET/POST /api/reader/favorites[/{storyId}]
// GET  /api/stories/{storyId}/comments        POST /api/reader/stories/{storyId}/comments
// DELETE /api/reader/comments/{id}
import api from "./api";
import { USE_REST } from "./config";
import convex from "./convexClient";

const token = () => localStorage.getItem("cyp_token") || undefined;

// ---------------------------------------------------------------------------
// Reading progress
// ---------------------------------------------------------------------------

export async function getProgress(storyId) {
  if (USE_REST) {
    const { data } = await api.get(`/api/reader/progress/${storyId}`);
    return data;
  }
  return convex.query("reading:getProgress", { token: token(), storyId });
}

export async function saveProgress(storyId, sceneId) {
  if (USE_REST) {
    const { data } = await api.post("/api/reader/progress", { storyId, sceneId });
    return data;
  }
  await convex.mutation("reading:saveProgress", { token: token(), storyId, sceneId });
}

export async function readingHistory() {
  if (USE_REST) {
    const { data } = await api.get("/api/reader/progress");
    return data;
  }
  return convex.query("reading:readingHistory", { token: token() });
}

// ---------------------------------------------------------------------------
// Perspective / path discovery
// ---------------------------------------------------------------------------

export async function discoverPath(storyId, choiceId) {
  if (USE_REST) {
    const { data } = await api.post(`/api/reader/stories/${storyId}/paths`, { choiceId });
    return data;
  }
  return convex.mutation("reading:discoverPath", { token: token(), storyId, choiceId });
}

export async function storyPaths(storyId) {
  if (USE_REST) {
    const { data } = await api.get(`/api/reader/stories/${storyId}/paths`);
    return data;
  }
  return convex.query("reading:storyPaths", { token: token(), storyId });
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export async function myFavorites() {
  if (USE_REST) {
    const { data } = await api.get("/api/reader/favorites");
    return data;
  }
  return convex.query("reading:myFavorites", { token: token() });
}

export async function isFavorite(storyId) {
  if (USE_REST) {
    const { data } = await api.get(`/api/reader/favorites/${storyId}`);
    return Boolean(data);
  }
  return convex.query("reading:isFavorite", { token: token(), storyId });
}

export async function toggleFavorite(storyId) {
  if (USE_REST) {
    const { data } = await api.post(`/api/reader/favorites/${storyId}`);
    return Boolean(data);
  }
  return convex.mutation("reading:toggleFavorite", { token: token(), storyId });
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export async function listComments(storyId) {
  if (USE_REST) {
    const { data } = await api.get(`/api/stories/${storyId}/comments`);
    return data;
  }
  return convex.query("reading:listComments", { storyId });
}

export async function addComment(storyId, commentText) {
  if (USE_REST) {
    const { data } = await api.post(`/api/reader/stories/${storyId}/comments`, { commentText });
    return data;
  }
  await convex.mutation("reading:addComment", { token: token(), storyId, commentText });
}

export async function deleteComment(id) {
  if (USE_REST) {
    await api.delete(`/api/reader/comments/${id}`);
    return;
  }
  await convex.mutation("reading:deleteComment", { token: token(), id });
}
