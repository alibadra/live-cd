import { getMatchsDuJour, getStatsEquipe, getFlagForLeague } from "@/lib/football";
import { formeFromString, calculerForce, pronoAuto, calculerXG } from "@/lib/prono-engine";

export const revalidate = 300; // ISR Next.js — recalcule toutes les 5 min

const SEASON = new Date().getFullYear();

export async function GET() {
  try {
    // ── 1 appel API-Football pour tous les matchs du jour ────────────────
    const fixtures = await getMatchsDuJour();

    if (fixtures.length === 0) {
      return Response.json({ matches: [], total: 0, updatedAt: new Date().toISOString() });
    }

    // ── Stats en parallèle (2 appels × N matchs) ─────────────────────────
    const enriched = await Promise.all(
      fixtures.map(async (f: any) => {
        const [statsH, statsA] = await Promise.all([
          getStatsEquipe(f.teams.home.id, f.league.id, SEASON),
          getStatsEquipe(f.teams.away.id, f.league.id, SEASON),
        ]);

        const homeStr = calculerForce(statsH);
        const awayStr = calculerForce(statsA);
        const { res, confiance } = pronoAuto(homeStr, awayStr);
        const { xgH, xgA } = calculerXG(homeStr, awayStr);

        const isLive = ["1H", "HT", "2H", "ET", "BT", "P"].includes(
          f.fixture.status.short
        );

        return {
          id:      f.fixture.id,
          league:  `${getFlagForLeague(f.league.id)} ${f.league.name}`,
          time:    new Date(f.fixture.date).toLocaleTimeString("fr-FR", {
                     hour: "2-digit",
                     minute: "2-digit",
                     timeZone: "Africa/Kinshasa",
                   }),
          status:  f.fixture.status.short,
          live:    isLive,
          scoreH:  f.goals.home,
          scoreA:  f.goals.away,
          minute:  f.fixture.status.elapsed,
          home: {
            id:   f.teams.home.id,
            name: f.teams.home.name,
            logo: f.teams.home.logo,
            form: statsH?.form ? statsH.form.slice(-5).split("").reverse() : ["?","?","?","?","?"],
            str:  homeStr,
          },
          away: {
            id:   f.teams.away.id,
            name: f.teams.away.name,
            logo: f.teams.away.logo,
            form: statsH?.form ? statsH.form.slice(-5).split("").reverse() : ["?","?","?","?","?"],
            str:  awayStr,
          },
          res,
          confiance,
          xgH,
          xgA,
        };
      })
    );

    return Response.json({
      matches:   enriched,
      total:     enriched.length,
      updatedAt: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error("[/api/matches]", err.message);
    return Response.json(
      { matches: [], error: err.message },
      { status: 500 }
    );
  }
}
