// Convex HTTP client wrapper used by the services layer.
// Works outside React (no provider required) and memoizes the client.
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

let client = null;

export function getClient() {
  if (client) return client;
  const url = import.meta.env.VITE_CONVEX_URL;
  if (!url) throw new Error("VITE_CONVEX_URL is not configured.");
  client = new ConvexHttpClient(url);
  return client;
}

export default {
  async query(name, args) {
    const [mod, fn] = name.split(":");
    return getClient().query(anyApi[mod][fn], args);
  },
  async mutation(name, args) {
    const [mod, fn] = name.split(":");
    return getClient().mutation(anyApi[mod][fn], args);
  },
};
