// ChooseYourPath backend — admin management: users, stories, comments, stats.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateToken } from "./helpers";
import { deleteStoryDeep } from "./stories";

async function requireAdmin(ctx: any, token: string | undefined) {
  const s = await validateToken(ctx, token);
  if (!s) throw new Error("Please sign in to continue.");
  if (s.role !== "ADMIN") throw new Error("This action requires the ADMIN role.");
  return s;
}

export const stats = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const users = await ctx.db.query("users").collect();
    const stories = await ctx.db.query("stories").collect();
    const comments = await ctx.db.query("comments").collect();
    return {
      totalReaders: users.filter((u) => u.role === "READER").length,
      totalWriters: users.filter((u) => u.role === "WRITER").length,
      totalStories: stories.length,
      published: stories.filter((s) => s.status === "PUBLISHED").length,
      pending: stories.filter((s) => s.status === "PENDING").length,
      drafts: stories.filter((s) => s.status === "DRAFT").length,
      rejected: stories.filter((s) => s.status === "REJECTED").length,
      totalComments: comments.length,
      totalReads: stories.reduce((sum, s) => sum + s.reads, 0),
    };
  },
});

export const listUsers = query({
  args: { token: v.string(), role: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    let users = await ctx.db.query("users").collect();
    if (args.role) users = users.filter((u) => u.role === args.role);
    return users
      .map((u) => ({
        _id: u._id,
        username: u.username,
        role: u.role,
        bio: u.bio,
        createdAt: u.createdAt,
      }))
      .sort((a, b) => a.username.localeCompare(b.username));
  },
});

export const deleteUser = mutation({
  args: { token: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const me = await requireAdmin(ctx, args.token);
    if (args.userId === me.userId) throw new Error("You cannot delete your own account.");
    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found.");
    if (target.role === "ADMIN") throw new Error("Admin accounts cannot be deleted from the panel.");
    // Remove the user's stories and personal data.
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .collect();
    for (const st of stories) await deleteStoryDeep(ctx, st._id);
    const progress = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_story", (q) => q.eq("userId", args.userId))
      .collect();
    for (const p of progress) await ctx.db.delete(p._id);
    const paths = await ctx.db
      .query("pathProgress")
      .withIndex("by_user_story", (q) => q.eq("userId", args.userId))
      .collect();
    for (const p of paths) await ctx.db.delete(p._id);
    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_user_story", (q) => q.eq("userId", args.userId))
      .collect();
    for (const f of favs) await ctx.db.delete(f._id);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const sess of sessions) await ctx.db.delete(sess._id);
    await ctx.db.delete(args.userId);
  },
});

export const listAllStories = query({
  args: { token: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    let stories = await ctx.db.query("stories").collect();
    if (args.status) stories = stories.filter((s) => s.status === args.status);
    return stories.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const approveStory = mutation({
  args: { token: v.string(), id: v.id("stories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.id, { status: "PUBLISHED", updatedAt: Date.now() });
  },
});

export const rejectStory = mutation({
  args: { token: v.string(), id: v.id("stories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.id, { status: "REJECTED", updatedAt: Date.now() });
  },
});

export const adminDeleteStory = mutation({
  args: { token: v.string(), id: v.id("stories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await deleteStoryDeep(ctx, args.id);
  },
});

export const listAllComments = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    return ctx.db
      .query("comments")
      .collect()
      .then((r) => r.sort((a, b) => b.createdAt - a.createdAt));
  },
});

export const adminDeleteComment = mutation({
  args: { token: v.string(), id: v.id("comments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const comment = await ctx.db.get(args.id);
    if (comment) await ctx.db.delete(args.id);
  },
});

export const setRole = mutation({
  args: { token: v.string(), userId: v.id("users"), role: v.union(v.literal("READER"), v.literal("WRITER")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found.");
    if (target.role === "ADMIN") throw new Error("Admin accounts cannot be changed.");
    await ctx.db.patch(args.userId, { role: args.role });
  },
});
