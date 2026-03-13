# live.cd — Pronos & Scores ⚡

Plateforme de pronostics foot IA pour le marché congolais et africain.

## Stack

- **Next.js 14** (App Router) — framework frontend + API routes
- **Vercel** — hébergement + Edge Runtime
- **API-Football** — données matchs, stats, scores live
- **Anthropic Claude** — analyse IA streamée par match
- **PWA** — installable sur mobile (iOS + Android)

## Lancer en local

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier d'environnement
cp .env.example .env.local
# → Remplis API_FOOTBALL_KEY et ANTHROPIC_API_KEY

# 3. Lancer le serveur de développement
npm run dev
# → Ouvre http://localhost:3000
```

## Déployer sur Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Ajouter les variables dans Vercel Dashboard → Settings → Environment Variables :
- `API_FOOTBALL_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SITE_URL` → https://live.cd

## Quota API-Football (plan gratuit)

| Opération | Appels |
|-----------|--------|
| Matchs du jour | 1 |
| Stats par match (×10) | 20 |
| **Total/jour** | **~21** |
| Quota gratuit | 100 |

## Structure

```
app/
├── page.tsx              # Homepage PWA
└── api/
    ├── matches/route.ts  # Données API-Football
    └── analyze/route.ts  # Analyse IA streaming
lib/
├── football.ts           # Client API-Football
└── prono-engine.ts       # Calcul force/forme/xG
public/
└── manifest.json         # PWA manifest
```

## Ligues couvertes

- 🇫🇷 Ligue 1
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
- 🇪🇸 La Liga
- 🇩🇪 Bundesliga
- 🇮🇹 Serie A
- 🌍 CAF Champions League
- 🇨🇩 Vodacom Ligue 1 (RDC)
