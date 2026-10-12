// Runtime transport switch.
//
// - If VITE_API_URL is set (e.g. http://localhost:8080), all services talk to
//   the Spring Boot + MySQL backend over REST (JWT in Authorization header).
// - Otherwise the same services talk to the Convex backend, which is the
//   database the preview runs against. The REST endpoint each function maps
//   to is documented above each function.
//
// Both backends implement the same contract (see docs/API.md).

export const REST_BASE = import.meta.env.VITE_API_URL || "";
export const USE_REST = Boolean(REST_BASE);
export const CONVEX = Boolean(import.meta.env.VITE_CONVEX_URL);
