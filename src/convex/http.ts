// HTTP router for the ChooseYourPath Convex backend.
// Auth runs through Convex actions (src/convex/auth.ts) rather than HTTP
// routes, so only the health endpoint is exposed here.
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

export const seedHttp = httpAction(async (ctx) => {
  await ctx.runMutation(api.seed.seedAll, {});
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

const http = httpRouter();
http.route({
  path: "/seed",
  method: "POST",
  handler: seedHttp,
});

export default http;
