// ── Forme depuis le champ "form" de l'API (ex: "WWDLW") ───────────────────
export function formeFromString(formStr?: string): string[] {
  if (!formStr) return ["D", "D", "D", "D", "D"];
  return formStr.slice(-5).split("").reverse(); // plus récent en premier
}

// ── Score de force 0-99 basé sur les stats de saison ──────────────────────
export function calculerForce(stats: any): number {
  if (!stats) return 50;

  const played   = stats.fixtures?.played?.total       ?? 0;

  if (played < 3) return 50;

  const wins     = stats.fixtures?.wins?.total          ?? 0;
  const goals    = stats.goals?.for?.total?.total       ?? 0;
  const conceded = stats.goals?.against?.total?.total   ?? 0;

  const winRate = (wins / played) * 40;
  const attack  = Math.min((goals / played) * 10, 30);
  const defense = Math.max(30 - (conceded / played) * 10, 0);

  return Math.round(Math.min(winRate + attack + defense, 99));
}

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
