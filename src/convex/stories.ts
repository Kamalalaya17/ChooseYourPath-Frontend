// ChooseYourPath backend — stories, scenes, choices, writer ownership.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateToken } from "./helpers";

async function requireRole(ctx: any, token: string | undefined, role: string) {
  const s = await validateToken(ctx, token);
  if (!s) throw new Error("Please sign in to continue.");
  if (role && s.role !== role) {
    throw new Error(`This action requires the ${role} role.`);
  }
  return s;
}

// ---------------------------------------------------------------------------
// Public catalog (readers + guests)
// ---------------------------------------------------------------------------

export const listPublished = query({
  args: { search: v.optional(v.string()), genre: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let stories = await ctx.db
      .query("stories")
      .withIndex("by_status", (q) => q.eq("status", "PUBLISHED"))
      .collect();
    if (args.genre && args.genre !== "all") {
      stories = stories.filter((s) => s.genre === args.genre);
    }
    const q = args.search?.trim().toLowerCase();
    if (q) {
      stories = stories.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.authorName.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q),
      );
    }
    return stories.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getStory = query({
  args: { id: v.id("stories"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.id);
    if (!story) return null;
    if (story.status !== "PUBLISHED") {
      const s = await validateToken(ctx, args.token);
      const allowed =
        s && (s.role === "ADMIN" || (s.role === "WRITER" && story.authorId === s.userId));
      if (!allowed) return null;
    }
    return story;
  },
});

export const getScenes = query({
  args: { storyId: v.id("stories"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) return [];
    if (story.status !== "PUBLISHED") {
      const s = await validateToken(ctx, args.token);
      const allowed =
        s && (s.role === "ADMIN" || (s.role === "WRITER" && story.authorId === s.userId));
      if (!allowed) return [];
    }
    const scenes = await ctx.db
      .query("scenes")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();
    scenes.sort((a, b) => a.sceneOrder - b.sceneOrder);
    return scenes;
  },
});

export const getScene = query({
  args: { sceneId: v.id("scenes"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const scene = await ctx.db.get(args.sceneId);
    if (!scene) return null;
    const choices = await ctx.db
      .query("choices")
      .withIndex("by_scene", (q) => q.eq("sceneId", args.sceneId))
      .collect();
    return { scene, choices };
  },
});

export const getStyles = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) =>
    ctx.db.query("storyStyles").withIndex("by_story", (q) => q.eq("storyId", args.storyId)).collect(),
});

export const getSceneImages = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) =>
    ctx.db.query("sceneImages").withIndex("by_story", (q) => q.eq("storyId", args.storyId)).collect(),
});

export const getSceneImage = query({
  args: { sceneId: v.id("scenes") },
  handler: async (ctx, args) => {
    const img = await ctx.db
      .query("sceneImages")
      .withIndex("by_scene", (q: any) => q.eq("sceneId", args.sceneId))
      .first();
    return img ?? null;
  },
});

// ---------------------------------------------------------------------------
// Writer — stories
// ---------------------------------------------------------------------------

export const myStories = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const s = await requireRole(ctx, args.token, "WRITER");
    return ctx.db
      .query("stories")
      .withIndex("by_author", (q: any) => q.eq("authorId", s.userId))
      .collect()
      .then((r) => r.sort((a, b) => b.createdAt - a.createdAt));
  },
});

async function ownedStory(ctx: any, token: string, storyId: string) {
  const s = await requireRole(ctx, token, "WRITER");
  const story = await ctx.db.get(storyId as any);
  if (!story) throw new Error("Story not found.");
  if (story.authorId !== s.userId) {
    throw new Error("You can only manage your own stories.");
  }
  return story;
}

export const createStory = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.string(),
    genre: v.string(),
    theme: v.string(),
    writingStyle: v.string(),
    narrative: v.string(),
    coverStyle: v.string(),
    styles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const s = await requireRole(ctx, args.token, "WRITER");
    const title = args.title.trim();
    if (title.length < 3) throw new Error("Title is required (min 3 characters).");
    if (args.description.trim().length < 10) throw new Error("Description is required.");
    if (!args.genre) throw new Error("Genre is required.");
    if (args.narrative.trim().length < 10) throw new Error("Narrative is required.");
    const now = Date.now();
    const storyId = await ctx.db.insert("stories", {
      title,
      description: args.description.trim(),
      genre: args.genre,
      theme: args.theme.trim() || "",
      writingStyle: args.writingStyle.trim() || "",
      narrative: args.narrative.trim(),
      coverStyle: args.coverStyle,
      status: "DRAFT",
      authorId: s.userId,
      authorName: s.username,
      reads: 0,
      likesCount: 0,
      sceneCount: 0,
      endingCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    for (const name of args.styles) {
      await ctx.db.insert("storyStyles", {
        storyId,
        styleName: name,
        styleDescription: STYLE_DESCRIPTIONS[name] ?? "",
      });
    }
    return storyId;
  },
});

export const updateStory = mutation({
  args: {
    token: v.string(),
    id: v.id("stories"),
    title: v.string(),
    description: v.string(),
    genre: v.string(),
    theme: v.string(),
    writingStyle: v.string(),
    narrative: v.string(),
    coverStyle: v.string(),
  },
  handler: async (ctx, args) => {
    await ownedStory(ctx, args.token, args.id);
    if (args.title.trim().length < 3) throw new Error("Title is required.");
    await ctx.db.patch(args.id, {
      title: args.title.trim(),
      description: args.description.trim(),
      genre: args.genre,
      theme: args.theme.trim(),
      writingStyle: args.writingStyle.trim(),
      narrative: args.narrative.trim(),
      coverStyle: args.coverStyle,
      updatedAt: Date.now(),
    });
  },
});

export const deleteStory = mutation({
  args: { token: v.string(), id: v.id("stories") },
  handler: async (ctx, args) => {
    await ownedStory(ctx, args.token, args.id);
    await deleteStoryDeep(ctx, args.id);
  },
});

export async function deleteStoryDeep(ctx: any, storyId: string) {
  const scenes = await ctx.db
    .query("scenes")
    .withIndex("by_story", (q: any) => q.eq("storyId", storyId))
    .collect();
  for (const sc of scenes) {
    const chs = await ctx.db
      .query("choices")
      .withIndex("by_scene", (q: any) => q.eq("sceneId", sc._id))
      .collect();
    for (const ch of chs) await ctx.db.delete(ch._id);
    const imgs = await ctx.db
      .query("sceneImages")
      .withIndex("by_scene", (q: any) => q.eq("sceneId", sc._id))
      .collect();
    for (const im of imgs) await ctx.db.delete(im._id);
    await ctx.db.delete(sc._id);
  }
  for (const table of ["storyStyles"] as const) {
    const rows = await ctx.db
      .query(table)
      .withIndex("by_story", (q: any) => q.eq("storyId", storyId))
      .collect();
    for (const r of rows) await ctx.db.delete(r._id);
  }
  const comments = await ctx.db
    .query("comments")
    .withIndex("by_story", (q: any) => q.eq("storyId", storyId))
    .collect();
  for (const c of comments) await ctx.db.delete(c._id);
  await ctx.db.delete(storyId as any);
}

export const submitForReview = mutation({
  args: { token: v.string(), id: v.id("stories") },
  handler: async (ctx, args) => {
    const story = await ownedStory(ctx, args.token, args.id);
    if (story.endingCount < 1) {
      throw new Error("Add at least one ending scene before submitting for review.");
    }
    await ctx.db.patch(args.id, { status: "PENDING", updatedAt: Date.now() });
  },
});

export const unpublish = mutation({
  args: { token: v.string(), id: v.id("stories") },
  handler: async (ctx, args) => {
    await ownedStory(ctx, args.token, args.id);
    await ctx.db.patch(args.id, { status: "DRAFT", updatedAt: Date.now() });
  },
});

// ---------------------------------------------------------------------------
// Writer — scenes
// ---------------------------------------------------------------------------

export const createScene = mutation({
  args: {
    token: v.string(),
    storyId: v.id("stories"),
    title: v.string(),
    narration: v.string(),
    sceneDescription: v.string(),
    isEnding: v.boolean(),
    endingLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const story = await ownedStory(ctx, args.token, args.storyId);
    if (args.title.trim().length < 1) throw new Error("Scene title is required.");
    if (args.narration.trim().length < 10) throw new Error("Narration is required.");
    const existing = await ctx.db
      .query("scenes")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();
    const order = existing.length + 1;
    const sceneId = await ctx.db.insert("scenes", {
      storyId: args.storyId,
      sceneOrder: order,
      title: args.title.trim(),
      narration: args.narration.trim(),
      sceneDescription: args.sceneDescription.trim(),
      isEnding: args.isEnding,
      endingLabel: args.isEnding ? args.endingLabel?.trim() || "THE END" : undefined,
    });
    // One illustration per style the story offers.
    for (const style of await ctx.db
      .query("storyStyles")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect()) {
      await ctx.db.insert("sceneImages", {
        sceneId,
        storyId: args.storyId,
        styleName: style.styleName,
        seed: (order * 977 + style.styleName.length * 31 + story.createdAt % 1000) % 100000,
        palette: style.styleName,
      });
    }
    const endings = existing.filter((e) => e.isEnding).length + (args.isEnding ? 1 : 0);
    await ctx.db.patch(args.storyId, { sceneCount: order, endingCount: endings, updatedAt: Date.now() });
    return sceneId;
  },
});

export const updateScene = mutation({
  args: {
    token: v.string(),
    id: v.id("scenes"),
    title: v.string(),
    narration: v.string(),
    sceneDescription: v.string(),
    isEnding: v.boolean(),
    endingLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const scene = await ctx.db.get(args.id);
    if (!scene) throw new Error("Scene not found.");
    await ownedStory(ctx, args.token, scene.storyId);
    await ctx.db.patch(args.id, {
      title: args.title.trim(),
      narration: args.narration.trim(),
      sceneDescription: args.sceneDescription.trim(),
      isEnding: args.isEnding,
      endingLabel: args.isEnding ? args.endingLabel?.trim() || "THE END" : undefined,
    });
  },
});

export const deleteScene = mutation({
  args: { token: v.string(), id: v.id("scenes") },
  handler: async (ctx, args) => {
    const scene = await ctx.db.get(args.id);
    if (!scene) throw new Error("Scene not found.");
    await ownedStory(ctx, args.token, scene.storyId);
    const chs = await ctx.db
      .query("choices")
      .withIndex("by_scene", (q) => q.eq("sceneId", args.id))
      .collect();
    for (const ch of chs) await ctx.db.delete(ch._id);
    await ctx.db.delete(args.id);
    const remaining = await ctx.db
      .query("scenes")
      .withIndex("by_story", (q) => q.eq("storyId", scene.storyId))
      .collect();
    await ctx.db.patch(scene.storyId, {
      sceneCount: remaining.length,
      endingCount: remaining.filter((r: any) => r.isEnding).length,
      updatedAt: Date.now(),
    });
  },
});

// ---------------------------------------------------------------------------
// Writer — choices
// ---------------------------------------------------------------------------

export const createChoice = mutation({
  args: {
    token: v.string(),
    sceneId: v.id("scenes"),
    choiceText: v.string(),
    nextSceneId: v.optional(v.id("scenes")),
    pathName: v.string(),
    consequence: v.string(),
  },
  handler: async (ctx, args) => {
    const scene = await ctx.db.get(args.sceneId);
    if (!scene) throw new Error("Scene not found.");
    await ownedStory(ctx, args.token, scene.storyId);
    if (scene.isEnding) throw new Error("Ending scenes cannot have outgoing choices.");
    if (args.choiceText.trim().length < 1) throw new Error("Choice text is required.");
    if (!args.nextSceneId) throw new Error("Every choice must lead to a next scene.");
    await ctx.db.insert("choices", {
      sceneId: args.sceneId,
      storyId: scene.storyId,
      choiceText: args.choiceText.trim(),
      nextSceneId: args.nextSceneId,
      pathName: args.pathName.trim() || "Unnamed Path",
      consequence: args.consequence.trim(),
    });
  },
});

export const updateChoice = mutation({
  args: {
    token: v.string(),
    id: v.id("choices"),
    choiceText: v.string(),
    nextSceneId: v.optional(v.id("scenes")),
    pathName: v.string(),
    consequence: v.string(),
  },
  handler: async (ctx, args) => {
    const choice = await ctx.db.get(args.id);
    if (!choice) throw new Error("Choice not found.");
    await ownedStory(ctx, args.token, choice.storyId);
    if (!args.nextSceneId) throw new Error("Every choice must lead to a next scene.");
    await ctx.db.patch(args.id, {
      choiceText: args.choiceText.trim(),
      nextSceneId: args.nextSceneId,
      pathName: args.pathName.trim() || "Unnamed Path",
      consequence: args.consequence.trim(),
    });
  },
});

export const deleteChoice = mutation({
  args: { token: v.string(), id: v.id("choices") },
  handler: async (ctx, args) => {
    const choice = await ctx.db.get(args.id);
    if (!choice) throw new Error("Choice not found.");
    await ownedStory(ctx, args.token, choice.storyId);
    await ctx.db.delete(args.id);
  },
});

export const STYLE_DESCRIPTIONS: Record<string, string> = {
  "Classic Storybook": "Warm parchment tones, soft ink lines, gentle gilt accents.",
  "Watercolor": "Washed gradients and bleeding pigments with delicate edges.",
  "Dark Forest": "Deep indigo shadows, pale moonlight, dense silhouettes.",
  "Dreamlike": "Hazy lavender light, floating orbs, soft-focus wonder.",
  "Vintage Illustration": "Aged sepia etching with fine hatching and brass details.",
  "Ink": "High-contrast black ink strokes on aged paper.",
  "Gothic": "Candlelit stone, iron filigree, brooding violet dusk.",
  "Paper Cut": "Layered paper shapes with crisp edges and long shadows.",
  "Fairy Tale": "Pastel meadows, golden light, storybook flourish.",
  "Comic Illustration": "Bold outlines, halftone dots, dynamic color blocks.",
  "Mystical": "Teal mist, glowing runes, drifting embers.",
  "Celestial": "Midnight sky, constellations and prismatic starlight.",
};
