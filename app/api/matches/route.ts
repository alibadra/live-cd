import { getMatchsDuJour, getClassement, getFlagForLeague } from "@/lib/football";
import { pronoAuto, calculerXG } from "@/lib/prono-engine";

export const revalidate = 300;

export async function GET() {
  try {
    const fixtures = await getMatchsDuJour();

    if (fixtures.length === 0) {
      return Response.json({ matches: [], total: 0, updatedAt: new Date().toISOString() });
    }

    // Récupère les classements de toutes les ligues présentes (en parallèle)
    const leagueIds = Array.from(new Set(fixtures.map((f: any) => f.league.id as number)));
    const classements: Record<number, any[]> = {};
    await Promise.all(
      leagueIds.map(async (id) => {
        classements[id] = await getClassement(id);
      })
    );

    // Force depuis le classement : position, points, buts
    function forceDepuisClassement(teamId: number, leagueId: number): { force: number; forme: string[] } {
      const standing = classements[leagueId] ?? [];
      const team = standing.find((t: any) => t.team.id === teamId);

      if (!team) return { force: 50, forme: ["?","?","?","?","?"] };

      const total    = standing.length || 20;
      const rank     = team.rank ?? total;
      const points   = team.points ?? 0;
      const played   = team.all?.played ?? 1;
      const goals    = team.all?.goals?.for ?? 0;
      const conceded = team.all?.goals?.against ?? 0;

      // Force : 40% classement inversé + 30% attaque + 30% défense
      const rankScore   = ((total - rank) / total) * 40;
      const attackScore = Math.min((goals / played) * 10, 30);
      const defScore    = Math.max(30 - (conceded / played) * 10, 0);
      const force       = Math.round(Math.min(rankScore + attackScore + defScore, 99));

      // Forme depuis l'API (ex: "WWDLW")
      const formeStr = team.form ?? "";
      const forme = formeStr.length > 0
        ? formeStr.slice(-5).split("").reverse()
        : ["?","?","?","?","?"];

      return { force, forme };
    }

    const enriched = fixtures.map((f: any) => {
      const { force: homeStr, forme: homeForme } = forceDepuisClassement(f.teams.home.id, f.league.id);
      const { force: awayStr, forme: awayForme } = forceDepuisClassement(f.teams.away.id, f.league.id);

      const { res, confiance } = pronoAuto(homeStr, awayStr);
      const { xgH, xgA }       = calculerXG(homeStr, awayStr);

      const isLive = ["1H","HT","2H","ET","BT","P"].includes(f.fixture.status.short);

      return {
        id:      f.fixture.id,
        league:  `${getFlagForLeague(f.league.id)} ${f.league.name}`,
        time:    new Date(f.fixture.date).toLocaleTimeString("fr-FR", {
                   hour: "2-digit", minute: "2-digit",
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
          form: homeForme,
          str:  homeStr,
        },
        away: {
          id:   f.teams.away.id,
          name: f.teams.away.name,
          logo: f.teams.away.logo,
          form: awayForme,
          str:  awayStr,
        },
        res,
        confiance,
        xgH,
        xgA,
      };
    });

    return Response.json({
      matches:   enriched,
      total:     enriched.length,
      updatedAt: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error("[/api/matches]", err.message);
    return Response.json({ matches: [], error: err.message }, { status: 500 });
  }
}