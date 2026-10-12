import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ChooseYourPath — scene-based branching story platform.
// Roles: READER | WRITER | ADMIN (fixed at account creation).

export const ROLES = {
  READER: "READER",
  WRITER: "WRITER",
  ADMIN: "ADMIN",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.READER),
  v.literal(ROLES.WRITER),
  v.literal(ROLES.ADMIN),
);

export const STORY_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
} as const;

export const statusValidator = v.union(
  v.literal(STORY_STATUS.DRAFT),
  v.literal(STORY_STATUS.PENDING),
  v.literal(STORY_STATUS.PUBLISHED),
  v.literal(STORY_STATUS.REJECTED),
);

export const ART_STYLES = [
  "Classic Storybook",
  "Watercolor",
  "Dark Forest",
  "Dreamlike",
  "Vintage Illustration",
  "Ink",
  "Gothic",
  "Paper Cut",
  "Fairy Tale",
  "Comic Illustration",
  "Mystical",
  "Celestial",
] as const;const schema = defineSchema({
  users: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    role: roleValidator,
    bio: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_role", ["role"]),

  sessions: defineTable({
    token: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  stories: defineTable({
    title: v.string(),
    description: v.string(),
    genre: v.string(),
    theme: v.string(),
    writingStyle: v.string(),
    narrative: v.string(),
    coverStyle: v.string(), // art style key used for the generated cover
    status: statusValidator,
    authorId: v.id("users"),
    authorName: v.string(),
    reads: v.number(),
    likesCount: v.number(),
    sceneCount: v.number(),
    endingCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status", "createdAt"])
    .index("by_author", ["authorId", "createdAt"])
    .index("by_genre", ["genre"]),

  // One node in the branching graph. Endings carry endingLabel.
  scenes: defineTable({
    storyId: v.id("stories"),
    sceneOrder: v.number(),
    title: v.string(),
    narration: v.string(),
    sceneDescription: v.string(),
    isEnding: v.boolean(),
    endingLabel: v.optional(v.string()),
  }).index("by_story", ["storyId", "sceneOrder"]),

  // An edge in the graph: from a scene, choose text -> next scene.
  choices: defineTable({
    sceneId: v.id("scenes"),
    storyId: v.id("stories"),
    choiceText: v.string(),
    nextSceneId: v.optional(v.id("scenes")),
    pathName: v.string(),
    consequence: v.string(),
  })
    .index("by_scene", ["sceneId"])
    .index("by_story", ["storyId"]),

  storyStyles: defineTable({
    storyId: v.id("stories"),
    styleName: v.string(),
    styleDescription: v.string(),
  }).index("by_story", ["storyId"]),

  // Links a scene to a per-style illustration generated from sceneDescription.
  sceneImages: defineTable({
    sceneId: v.id("scenes"),
    storyId: v.id("stories"),
    styleName: v.string(),
    seed: v.number(),
    palette: v.string(),
  })
    .index("by_scene", ["sceneId"])
    .index("by_story", ["storyId"]),

  // A discovered narrative path: one row per (user, choice) — unique.
  pathProgress: defineTable({
    userId: v.id("users"),
    storyId: v.id("stories"),
    choiceId: v.id("choices"),
    pathName: v.string(),
    discoveredAt: v.number(),
  }).index("by_user_story", ["userId", "storyId"]),

  readingProgress: defineTable({
    userId: v.id("users"),
    storyId: v.id("stories"),
    currentSceneId: v.id("scenes"),
    progressPercentage: v.number(),
    updatedAt: v.number(),
  }).index("by_user_story", ["userId", "storyId"]),

  favorites: defineTable({
    userId: v.id("users"),
    storyId: v.id("stories"),
    createdAt: v.number(),
  }).index("by_user_story", ["userId", "storyId"]),

  comments: defineTable({
    storyId: v.id("stories"),
    userId: v.id("users"),
    authorName: v.string(),
    commentText: v.string(),
    createdAt: v.number(),
  }).index("by_story", ["storyId", "createdAt"]),
});

export default schema;
