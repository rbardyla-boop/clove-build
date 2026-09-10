import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CODE_WATCH_INTERFACE, type CodeWatchStage } from "./pipeline";

export type SourceSnapshot = {
  id: string;
  locator: string;
  retrieved: string;
  bytes: number;
  sha256: string;
};

export type CandidateChange = {
  sourceId: string;
  previous?: SourceSnapshot;
  next: SourceSnapshot;
  requiresHumanReview: true;
  autoActivate: false;
};

export type CodeWatchState = {
  stages: CodeWatchStage[];
  snapshots: SourceSnapshot[];
  candidates: CandidateChange[];
};

function rootDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../../..");
}

/**
 * Snapshot official *metadata* already in the repo (source-manifest).
 * Does not fetch the live web during tests. Does not rewrite rules.
 */
export function snapshotManifest(root = rootDir()): SourceSnapshot[] {
  const path = join(root, "research/source-manifest.json");
  const raw = readFileSync(path);
  const json = JSON.parse(raw.toString()) as { sources: { id: string; locator: string }[]; retrieved: string };
  return json.sources.map((s) => ({
    id: s.id,
    locator: s.locator,
    retrieved: json.retrieved,
    bytes: Buffer.byteLength(JSON.stringify(s)),
    sha256: createHash("sha256").update(JSON.stringify(s)).digest("hex"),
  }));
}

export function diffSnapshots(previous: SourceSnapshot[], next: SourceSnapshot[]): CandidateChange[] {
  const prev = new Map(previous.map((s) => [s.id, s]));
  const out: CandidateChange[] = [];
  for (const n of next) {
    const p = prev.get(n.id);
    if (!p || p.sha256 !== n.sha256) {
      out.push({
        sourceId: n.id,
        previous: p,
        next: n,
        requiresHumanReview: true,
        autoActivate: false,
      });
    }
  }
  return out;
}

export function inspectCodeWatch(root = rootDir()): CodeWatchState {
  const snapshots = snapshotManifest(root);
  return {
    stages: CODE_WATCH_INTERFACE.stages,
    snapshots,
    candidates: [],
  };
}
