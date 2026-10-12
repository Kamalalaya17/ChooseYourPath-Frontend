// Optional one-shot bootstrap for Convex sample stories. The seeder never
// creates demo login accounts and skips sample stories until a writer exists.
// On the REST path the Spring DataSeeder CommandLineRunner does this instead.
import convex from "./convexClient";
import { USE_REST } from "./config";

let seedPromise = null;

/** Fire-and-forget seed trigger. Returns the in-flight promise (or null on REST). */
export function ensureSeeded() {
  if (USE_REST) return null;
  if (!seedPromise) {
    seedPromise = convex
      .mutation("seed:seedAll", {})
      .catch(() => {
        // Allow a retry on the next call if Convex was momentarily unavailable.
        seedPromise = null;
      });
  }
  return seedPromise;
}

/** Wait for seeding to finish if it was triggered this session. */
export async function seedIfPending() {
  const p = ensureSeeded();
  if (p) await p;
}
