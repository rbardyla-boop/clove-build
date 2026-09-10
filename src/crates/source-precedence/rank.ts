export const SOURCE_PRECEDENCE = [
  "IN-FORCE STATUTE / REGULATION",
  "OFFICIAL AMENDING INSTRUMENT",
  "AUTHORITY-HAVING-JURISDICTION GUIDANCE",
  "NRC / CBHCC NATIONAL OR ADOPTION SUMMARY",
  "OTHER GOVERNMENT GUIDANCE",
  "SECONDARY SOURCE",
] as const;

export type SourceRank = (typeof SOURCE_PRECEDENCE)[number];

export type RankedSource = {
  id: string;
  rank: SourceRank;
  locator: string;
  note?: string;
};

const KIND_TO_RANK: Record<string, SourceRank> = {
  "official-legislation": "IN-FORCE STATUTE / REGULATION",
  "official-agency": "NRC / CBHCC NATIONAL OR ADOPTION SUMMARY",
  "official-news": "OTHER GOVERNMENT GUIDANCE",
  "code-development-body": "NRC / CBHCC NATIONAL OR ADOPTION SUMMARY",
  "secondary-consolidation": "SECONDARY SOURCE",
  project: "SECONDARY SOURCE",
};

export function rankSourceKind(kind: string): SourceRank {
  return KIND_TO_RANK[kind] ?? "SECONDARY SOURCE";
}

export type SourceConflict = {
  topic: string;
  higher: RankedSource;
  lower: RankedSource;
  resolution: "EXPOSE_CONFLICT";
};

/**
 * If a higher-precedence source and a lower one disagree, expose the conflict.
 * Never silently pick the convenient one.
 */
export function conflictsOnTopic(rows: RankedSource[], topic: string): SourceConflict[] {
  if (rows.length < 2) return [];
  const order = SOURCE_PRECEDENCE;
  const sorted = [...rows].sort((a, b) => order.indexOf(a.rank) - order.indexOf(b.rank));
  const out: SourceConflict[] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i]!;
      const b = sorted[j]!;
      if (a.note && b.note && a.note !== b.note) {
        out.push({ topic, higher: a, lower: b, resolution: "EXPOSE_CONFLICT" });
      }
    }
  }
  return out;
}
