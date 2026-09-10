import { packForDate, PEI_PACK } from "@/rule-packs/pei/pack";
import type { JurisdictionPack } from "./types";

const PACKS: Record<string, (date: string) => JurisdictionPack> = {
  "ca-pei": packForDate,
};

export function selectJurisdiction(id: string, projectDate: string): JurisdictionPack {
  const fn = PACKS[id];
  if (!fn) return PEI_PACK;
  return fn(projectDate);
}
