const BASE = "https://v3.football.api-sports.io";
const KEY  = process.env.API_FOOTBALL_KEY!;
const H    = { "x-apisports-key": KEY };

export const LEAGUES = [
  { id: 61,  name: "Ligue 1",           flag: "🇫🇷" },
  { id: 39,  name: "Premier League",    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 140, name: "La Liga",           flag: "🇪🇸" },
  { id: 78,  name: "Bundesliga",        flag: "🇩🇪" },
  { id: 135,  name: "Serie A",           flag: "🇮🇹" },
  { id: 12,  name: "CAF Champions L.",  flag: "🌍" },
  { id: 671, name: "Vodacom Ligue 1",   flag: "🇨🇩" },
];

export const LEAGUE_IDS = LEAGUES.map((l) => l.id);

// ── 1 seul appel pour tous les matchs du jour ──────────────────────────────
export async function getMatchsDuJour(): Promise<any[]> {
  const today = new Date().toISOString().split("T")[0];

  const res = await fetch(
    `${BASE}/fixtures?date=${today}&timezone=Africa%2FKinshasa`,
    {
      headers: H,
      next: { revalidate: 300 }, // cache Next.js 5 min
    }
  );

  if (!res.ok) throw new Error(`API-Football /fixtures: ${res.status}`);
  const data = await res.json();

  return (data.response ?? [])
    .filter((f: any) => LEAGUE_IDS.includes(f.league.id))
    .slice(0, 10); // max 10 matchs
}

// ── Stats saison (cache 24h — données lentes) ─────────────────────────────
export async function getStatsEquipe(
  teamId: number,
  leagueId: number,
  season: number
): Promise<any | null> {
  const res = await fetch(
    `${BASE}/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`,
    {
      headers: H,
      next: { revalidate: 86400 },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.response ?? null;
}

// ── Flag depuis l'id de ligue ─────────────────────────────────────────────
export function getFlagForLeague(leagueId: number): string {
  return LEAGUES.find((l) => l.id === leagueId)?.flag ?? "🏆";
}
