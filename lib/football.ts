const BASE = "https://v3.football.api-sports.io";
const KEY  = process.env.API_FOOTBALL_KEY!;
const H    = { "x-apisports-key": KEY };

export const LEAGUES = [
  { id: 61,  name: "Ligue 1",          flag: "🇫🇷" },
  { id: 39,  name: "Premier League",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 140, name: "La Liga",          flag: "🇪🇸" },
  { id: 78,  name: "Bundesliga",       flag: "🇩🇪" },
  { id: 135, name: "Serie A",          flag: "🇮🇹" },
  { id: 12,  name: "CAF Champions L.", flag: "🌍" },
  { id: 671, name: "Vodacom Ligue 1",  flag: "🇨🇩" },
];

export const LEAGUE_IDS = LEAGUES.map((l) => l.id);
const SEASON = 2025;

// ── Matchs du jour ────────────────────────────────────────────────────────
export async function getMatchsDuJour(): Promise<any[]> {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `${BASE}/fixtures?date=${today}&timezone=Africa%2FKinshasa`,
    { headers: H, next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`API-Football /fixtures: ${res.status}`);
  const data = await res.json();
  return (data.response ?? [])
    .filter((f: any) => LEAGUE_IDS.includes(f.league.id))
    .slice(0, 10);
}

// ── Classement d'une ligue (1 appel, très fiable) ────────────────────────
export async function getClassement(leagueId: number): Promise<any[]> {
  const res = await fetch(
    `${BASE}/standings?league=${leagueId}&season=${SEASON}`,
    { headers: H, next: { revalidate: 3600 } } // cache 1h
  );
  if (!res.ok) return [];
  const data = await res.json();
  // Retourne la liste à plat des équipes du classement
  return data.response?.[0]?.league?.standings?.[0] ?? [];
}

export function getFlagForLeague(leagueId: number): string {
  return LEAGUES.find((l) => l.id === leagueId)?.flag ?? "🏆";
}