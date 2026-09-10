/**
 * v0.1 persistence:
 * - No accounts.
 * - Break It mutations, explode, and construction stage reset on reload.
 * - Ryan Test marks persist in localStorage key `clove.ryan-test.v1`.
 * Reload must not corrupt the specimen: the graph is rebuilt from the
 * frozen baseline each session.
 */
export const PERSISTENCE = {
  mutations: "reset-on-reload",
  ryanTest: "localStorage",
} as const;
