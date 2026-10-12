
import api from "./api";
import { USE_REST } from "./config";
import convex from "./convexClient";

const getToken = () => localStorage.getItem("cyp_token") || undefined;

function toArray(data) {
  if (Array.isArray(data)) return data;
  return data?.content || [];
}

// Dashboard statistics
function normalizeStats(data = {}) {
  // Spring Boot StatsResponse uses readers/writers/stories/comments/reads;
  // older frontend pages use totalReaders/totalWriters/etc. Expose both.
  const readers = Number(data.totalReaders ?? data.readers ?? 0);
  const writers = Number(data.totalWriters ?? data.writers ?? 0);
  const stories = Number(data.totalStories ?? data.stories ?? 0);
  const comments = Number(data.totalComments ?? data.comments ?? 0);
  const reads = Number(data.totalReads ?? data.reads ?? 0);

  return {
    ...data,
    readers,
    writers,
    stories,
    comments,
    reads,
    totalReaders: readers,
    totalWriters: writers,
    totalStories: stories,
    totalComments: comments,
    totalReads: reads,
    published: Number(data.published ?? 0),
    pending: Number(data.pending ?? 0),
    drafts: Number(data.drafts ?? 0),
    rejected: Number(data.rejected ?? 0),
  };
}

export async function getStats() {
  let data;
  if (USE_REST) {
    const response = await api.get("/api/admin/stats");
    data = response.data;
  } else {
    data = await convex.query("admin:stats", { token: getToken() });
  }
  return normalizeStats(data);
}

export const getDashboardStats = getStats;
// Backward-compatible names used by existing admin pages.
export const stats = getStats;

// Users
export async function listUsers(role) {
  if (USE_REST) {
    const { data } = await api.get("/api/admin/users", {
      params: role ? { role } : {},
    });
    return toArray(data);
  }

  return convex.query("admin:listUsers", {
    token: getToken(),
    role: role || undefined,
  });
}

export async function updateUserRole(userId, role) {
  if (USE_REST) {
    const { data } = await api.put(
      `/api/admin/users/${userId}/role`,
      { role }
    );
    return data;
  }

  return convex.mutation("admin:setUserRole", {
    token: getToken(),
    userId,
    role,
  });
}

export const setRole = updateUserRole;

export async function deleteUser(userId) {
  if (USE_REST) {
    const { data } = await api.delete(`/api/admin/users/${userId}`);
    return data;
  }

  return convex.mutation("admin:deleteUser", {
    token: getToken(),
    userId,
  });
}

// Stories
export async function listStories(status) {
  if (USE_REST) {
    const { data } = await api.get("/api/admin/stories", {
      params: status ? { status } : {},
    });
    return toArray(data);
  }

  return convex.query("admin:listStories", {
    token: getToken(),
    status: status || undefined,
  });
}

// Complete story details for the admin review page
export async function getStoryForReview(id) {
  if (USE_REST) {
    const { data } = await api.get(
      `/api/admin/stories/${id}/review`
    );
    return data;
  }

  return convex.query("admin:getStoryForReview", {
    token: getToken(),
    id,
  });
}

export async function approveStory(id) {
  if (USE_REST) {
    const { data } = await api.put(
      `/api/admin/stories/${id}/approve`
    );
    return data;
  }

  return convex.mutation("admin:approveStory", {
    token: getToken(),
    id,
  });
}

export async function rejectStory(id) {
  if (USE_REST) {
    const { data } = await api.put(
      `/api/admin/stories/${id}/reject`
    );
    return data;
  }

  return convex.mutation("admin:rejectStory", {
    token: getToken(),
    id,
  });
}

export async function deleteStory(id) {
  if (USE_REST) {
    const { data } = await api.delete(
      `/api/admin/stories/${id}`
    );
    return data;
  }

  return convex.mutation("admin:deleteStory", {
    token: getToken(),
    id,
  });
}

// Comments
export async function listComments() {
  if (USE_REST) {
    const { data } = await api.get("/api/admin/comments");
    return toArray(data);
  }

  return convex.query("admin:allComments", {
    token: getToken(),
  });
}

export const allComments = listComments;

export async function deleteComment(commentId) {
  if (USE_REST) {
    const { data } = await api.delete(
      `/api/admin/comments/${commentId}`
    );
    return data;
  }

  return convex.mutation("admin:deleteComment", {
    token: getToken(),
    commentId,
  });
}
