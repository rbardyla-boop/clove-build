/** Format SI metres as metric + familiar imperial for display. */
export function formatMetres(m: number): { metric: string; imperial: string; both: string } {
  const abs = Math.abs(m);
  let metric: string;
  if (abs >= 1) metric = `${trimNum(m, 3)} m`;
  else metric = `${Math.round(m * 1000)} mm`;

  const totalIn = m / 0.0254;
  const sign = totalIn < 0 ? "-" : "";
  const inchesAbs = Math.abs(totalIn);
  const feet = Math.floor(inchesAbs / 12 + 1e-9);
  const inches = inchesAbs - feet * 12;
  const inchesRounded = Math.round(inches * 10) / 10;
  let imperial: string;
  if (feet === 0) imperial = `${sign}${inchesRounded}″`;
  else if (Math.abs(inchesRounded) < 0.05) imperial = `${sign}${feet}′-0″`;
  else imperial = `${sign}${feet}′-${inchesRounded}″`;

  return { metric, imperial, both: `${metric} (${imperial})` };
}

export function formatSize(size: [number, number, number]): string {
  return size.map((v) => formatMetres(v).both).join(" × ");
}

function trimNum(n: number, max = 3): string {
  const s = n.toFixed(max);
  return s.replace(/\.?0+$/, "");
}
