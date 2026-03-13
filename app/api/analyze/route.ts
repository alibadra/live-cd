import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const { match } = await req.json();

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 450,
    system: `Tu es un analyste foot expert couvrant le football africain et européen.
Tu donnes des pronostics structurés, honnêtes et argumentés en français.
Sois concis, factuel, et direct. Ne garantis jamais une victoire.

Format imposé (respecte exactement) :
Ligne 1-2 : forme récente des deux équipes
Ligne 3-4 : points clés du match
Ligne 5 : ✅ Recommandation finale avec cote conseillée
Ligne 6 : Confiance : 🟢 Élevée / 🟡 Moyenne / 🔴 Faible`,
    messages: [
      {
        role: "user",
        content: `Analyse ce match et donne un pronostic :

Match : ${match.home.name} vs ${match.away.name}
Compétition : ${match.league}
Force domicile  : ${match.home.str}%  | Forme : ${match.home.form?.join("") ?? "DDDDD"}
Force extérieur : ${match.away.str}%  | Forme : ${match.away.form?.join("") ?? "DDDDD"}
Prono algorithme : ${match.res} (confiance calculée : ${match.confiance}%)`,
      },
    ],
  });

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}
