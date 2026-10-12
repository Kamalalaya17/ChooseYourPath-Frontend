// Stories, scenes, choices — REST endpoints documented above each function.
// GET  /api/stories                          POST /api/writer/stories
// GET  /api/stories/{id}                     PUT  /api/writer/stories/{id}
// GET  /api/stories/{storyId}/scenes         POST /api/writer/stories/{storyId}/scenes
// PUT  /api/writer/scenes/{id}               DELETE /api/writer/scenes/{id}
// POST /api/writer/scenes/{sceneId}/choices  PUT  /api/writer/choices/{id}
import api from "./api";
import { USE_REST } from "./config";
import convex from "./convexClient";
import { seedIfPending } from "./bootstrap";

const T = () => localStorage.getItem("cyp_token") || undefined;

/** Spring returns a Page object { content: [...] }; Convex returns an array. */
function pageToArray(data) {
  return Array.isArray(data) ? data : data?.content || [];
}

// --- Catalog ---------------------------------------------------------------

export async function listStories({ search, genre, sort } = {}) {
  if (USE_REST) {
    const { data } = await api.get("/api/stories", {
      params: { search, genre: genre && genre !== "all" ? genre : undefined, sort },
    });
    return pageToArray(data);
  }
  await seedIfPending(); // first catalog read of the session triggers the seed
  return convex.query("stories:listPublished", {
    search: search || undefined,
    genre: genre && genre !== "all" ? genre : undefined,
  });
}

export async function getStory(id) {
  if (USE_REST) {
    const { data } = await api.get(`/api/stories/${id}`);
    return data;
  }
  return convex.query("stories:getStory", { id, token: T() });
}

export async function getScenes(storyId) {
  if (USE_REST) {
    const { data } = await api.get(`/api/stories/${storyId}/scenes`);
    return data;
  }
  return convex.query("stories:getScenes", { storyId, token: T() });
}

export async function getScene(sceneId) {
  if (USE_REST) {
    const { data } = await api.get(`/api/scenes/${sceneId}`);
    return data;
  }
  return convex.query("stories:getScene", { sceneId });
}

export async function getStyles(storyId) {
  if (USE_REST) {
    const { data } = await api.get(`/api/stories/${storyId}/styles`);
    return data;
  }
  return convex.query("stories:getStyles", { storyId });
}

/**
 * Per-scene, per-style illustration record. Best-effort: callers treat null
 * as "fall back to the scene description", so a missing REST route must not
 * surface as an error.
 */
export async function getSceneImage(sceneId) {
  if (USE_REST) {
    try {
      const { data } = await api.get(`/api/scenes/${sceneId}/image`);
      return data ?? null;
    } catch {
      return null;
    }
  }
  return convex.query("stories:getSceneImage", { sceneId });
}

// --- Writer: stories ---------------------------------------------------------

export async function myStories() {
  if (USE_REST) {
    const { data } = await api.get("/api/writer/stories");
    return data;
  }
  return convex.query("stories:myStories", { token: T() });
}

export async function createStory(payload) {
  if (USE_REST) {
    const { data } = await api.post("/api/writer/stories", payload);
    return data;
  }
  return convex.mutation("stories:createStory", { token: T(), ...payload });
}

export async function updateStory(id, payload) {
  if (USE_REST) {
    const { data } = await api.put(`/api/writer/stories/${id}`, payload);
    return data;
  }
  return convex.mutation("stories:updateStory", { token: T(), id, ...payload });
}

export async function deleteStory(id) {
  if (USE_REST) {
    await api.delete(`/api/writer/stories/${id}`);
    return;
  }
  await convex.mutation("stories:deleteStory", { token: T(), id });
}

export async function submitForReview(id) {
  if (USE_REST) {
    await api.put(`/api/writer/stories/${id}/submit`);
    return;
  }
  await convex.mutation("stories:submitForReview", { token: T(), id });
}

export async function unpublish(id) {
  if (USE_REST) {
    await api.put(`/api/writer/stories/${id}/unpublish`);
    return;
  }
  await convex.mutation("stories:unpublish", { token: T(), id });
}

// --- Writer: scenes ----------------------------------------------------------

export async function createScene(storyId, payload) {
  if (USE_REST) {
    const { data } = await api.post(`/api/writer/stories/${storyId}/scenes`, payload);
    return data;
  }
  return convex.mutation("stories:createScene", { token: T(), storyId, ...payload });
}

export async function updateScene(sceneId, payload) {
  // Return the updated row when REST supports it; callers still re-fetch the
  // scene list to verify persistence against the active backend.
  if (USE_REST) {
    const { data } = await api.put(`/api/writer/scenes/${sceneId}`, payload);
    return data ?? null;
  }
  return await convex.mutation("stories:updateScene", { token: T(), id: sceneId, ...payload });
}

export async function deleteScene(sceneId) {
  if (USE_REST) {
    await api.delete(`/api/writer/scenes/${sceneId}`);
    return;
  }
  await convex.mutation("stories:deleteScene", { token: T(), id: sceneId });
}

// --- Writer: choices ---------------------------------------------------------

export async function createChoice(sceneId, payload) {
  if (USE_REST) {
    const { data } = await api.post(`/api/writer/scenes/${sceneId}/choices`, payload);
    return data;
  }
  return convex.mutation("stories:createChoice", { token: T(), sceneId, ...payload });
}

export async function updateChoice(choiceId, payload) {
  if (USE_REST) {
    await api.put(`/api/writer/choices/${choiceId}`, payload);
    return;
  }
  await convex.mutation("stories:updateChoice", { token: T(), id: choiceId, ...payload });
}

export async function deleteChoice(choiceId) {
  if (USE_REST) {
    await api.delete(`/api/writer/choices/${choiceId}`);
    return;
  }
  await convex.mutation("stories:deleteChoice", { token: T(), id: choiceId });
}

export { STYLE_DESCRIPTIONS } from "./styleDescriptions";
