// ── Prono automatique avec avantage domicile ─────────────────────────────
export function pronoAuto(
  homeStr: number,
  awayStr: number
): { res: "1" | "N" | "2"; confiance: number } {
  const diff = homeStr - awayStr + 5; // +5 avantage domicile
  if (diff > 10)  return { res: "1", confiance: Math.min(50 + diff, 88) };
  if (diff < -10) return { res: "2", confiance: Math.min(50 + Math.abs(diff), 88) };
  return { res: "N", confiance: 46 };
}

// ── xG estimés (rapport de force avec correction domicile) ───────────────
export function calculerXG(
  homeStr: number,
  awayStr: number
): { xgH: number; xgA: number } {
  const hAdj = homeStr * 1.08;
  const total = hAdj + awayStr;
  return {
    xgH: Math.round((hAdj / total) * 100),
    xgA: Math.round((awayStr / total) * 100),
  };
}