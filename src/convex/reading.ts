// ChooseYourPath backend — reading progress, path discovery, favorites, comments.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateToken } from "./helpers";

async function requireUser(ctx: any, token: string | undefined) {
  const s = await validateToken(ctx, token);
  if (!s) throw new Error("Please sign in to continue.");
  return s;
}

// ---------------------------------------------------------------------------
// Reading progress
// ---------------------------------------------------------------------------

export const getProgress = query({
  args: { token: v.string(), storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const s = await requireUser(ctx, args.token);
    return ctx.db
      .query("readingProgress")
      .withIndex("by_user_story", (q) => q.eq("userId", s.userId).eq("storyId", args.storyId))
      .first();
  },
});

export const saveProgress = mutation({
  args: { token: v.string(), storyId: v.id("stories"), sceneId: v.id("scenes") },
  handler: async (ctx, args) => {
    const s = await requireUser(ctx, args.token);
    const scene = await ctx.db.get(args.sceneId);
    if (!scene) throw new Error("Scene not found.");
    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found.");

    const percentage = scene.isEnding
      ? 100
      : Math.max(5, Math.min(95, Math.round((scene.sceneOrder / Math.max(1, story.sceneCount)) * 90)));

    const existing = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_story", (q) => q.eq("userId", s.userId).eq("storyId", args.storyId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        currentSceneId: args.sceneId,
        progressPercentage: percentage,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("readingProgress", {
        userId: s.userId,
        storyId: args.storyId,
        currentSceneId: args.sceneId,
        progressPercentage: percentage,
        updatedAt: Date.now(),
      });
      await ctx.db.patch(args.storyId, { reads: story.reads + 1 });
    }
  },
});

export const readingHistory = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const s = await requireUser(ctx, args.token);
    const rows = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_story", (q) => q.eq("userId", s.userId))
      .collect();
    rows.sort((a, b) => b.updatedAt - a.updatedAt);
    const out = [];
    for (const row of rows) {
      const story = await ctx.db.get(row.storyId);
      if (!story) continue;
      out.push({
        storyId: row.storyId,
        title: story.title,
        genre: story.genre,
        coverStyle: story.coverStyle,
        sceneId: row.currentSceneId,
        progressPercentage: row.progressPercentage,
        updatedAt: row.updatedAt,
      });
    }
    return out;
  },
});

// ---------------------------------------------------------------------------
// Perspective / path discovery
// ---------------------------------------------------------------------------

/** Record that the reader followed a choice. Returns whether it was a NEW path. */
export const discoverPath = mutation({
  args: { token: v.string(), storyId: v.id("stories"), choiceId: v.id("choices") },
  handler: async (ctx, args) => {
    const s = await requireUser(ctx, args.token);
    const choice = await ctx.db.get(args.choiceId);
    if (!choice) throw new Error("Choice not found.");
    const existing = await ctx.db
      .query("pathProgress")
      .withIndex("by_user_story", (q) => q.eq("userId", s.userId).eq("storyId", args.storyId))
      .collect();
    const already = existing.some((p) => p.choiceId === args.choiceId);
    if (already) return { isNew: false };
    await ctx.db.insert("pathProgress", {
      userId: s.userId,
      storyId: args.storyId,
      choiceId: args.choiceId,
      pathName: choice.pathName,
      discoveredAt: Date.now(),
    });
    return { isNew: true };
  },
});

/** All distinct paths of a story with the reader's discovered flags. */
export const storyPaths = query({
  args: { token: v.optional(v.string()), storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const choices = await ctx.db
      .query("choices")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();

    // Deduplicate by pathName — the same narrative path can be reachable twice.
    const seen = new Map<string, Set<string>>();
    for (const c of choices) {
      if (!seen.has(c.pathName)) seen.set(c.pathName, new Set());
      seen.get(c.pathName)!.add(c._id);
    }

    let discoveredChoiceIds = new Set<string>();
    if (args.token) {
      const s = await validateToken(ctx, args.token);
      if (s) {
        const rows = await ctx.db
          .query("pathProgress")
          .withIndex("by_user_story", (q) => q.eq("userId", s.userId).eq("storyId", args.storyId))
          .collect();
        discoveredChoiceIds = new Set(rows.map((r) => r.choiceId));
      }
    }

    const out = [];
    for (const [pathName, choiceIds] of seen) {
      const discovered = [...choiceIds].some((id) => discoveredChoiceIds.has(id));
      out.push({ pathName, discovered });
    }
    out.sort((a, b) => Number(b.discovered) - Number(a.discovered) || a.pathName.localeCompare(b.pathName));
    return { paths: out, total: out.length, discovered: out.filter((p) => p.discovered).length };
  },
});

export const discoveredCount = query({
  args: { token: v.string(), storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const s = await requireUser(ctx, args.token);
    const rows = await ctx.db
      .query("pathProgress")
      .withIndex("by_user_story", (q) => q.eq("userId", s.userId).eq("storyId", args.storyId))
      .collect();
    return rows.length;
  },
});

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export const toggleFavorite = mutation({
  args: { token: v.string(), storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const s = await requireUser(ctx, args.token);
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_story", (q) => q.eq("userId", s.userId).eq("storyId", args.storyId))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("favorites", { userId: s.userId, storyId: args.storyId, createdAt: Date.now() });
    return true;
  },
});

export const myFavorites = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const s = await requireUser(ctx, args.token);
    const rows = await ctx.db
      .query("favorites")
      .withIndex("by_user_story", (q) => q.eq("userId", s.userId))
      .collect();
    const out = [];
    for (const row of rows.sort((a, b) => b.createdAt - a.createdAt)) {
      const story = await ctx.db.get(row.storyId);
      if (story) out.push(story);
    }
    return out;
  },
});

export const isFavorite = query({
  args: { token: v.string(), storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const s = await requireUser(ctx, args.token);
    const row = await ctx.db
      .query("favorites")
      .withIndex("by_user_story", (q) => q.eq("userId", s.userId).eq("storyId", args.storyId))
      .first();
    return row !== null;
  },
});

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export const listComments = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) =>
    ctx.db
      .query("comments")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect()
      .then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});

export const addComment = mutation({
  args: { token: v.string(), storyId: v.id("stories"), commentText: v.string() },
  handler: async (ctx, args) => {
    const s = await requireUser(ctx, args.token);
    const text = args.commentText.trim();
    if (text.length < 1) throw new Error("Comment cannot be empty.");
    if (text.length > 1000) throw new Error("Comment is too long (max 1000 characters).");
    await ctx.db.insert("comments", {
      storyId: args.storyId,
      userId: s.userId,
      authorName: s.username,
      commentText: text,
      createdAt: Date.now(),
    });
  },
});

export const deleteComment = mutation({
  args: { token: v.string(), id: v.id("comments") },
  handler: async (ctx, args) => {
    const s = await requireUser(ctx, args.token);
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found.");
    if (comment.userId !== s.userId && s.role !== "ADMIN") {
      throw new Error("You can only delete your own comments.");
    }
    await ctx.db.delete(args.id);
  },
});
