import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "live.cd — Pronostics Foot IA & Scores en Direct",
  description: "Pronostics football par intelligence artificielle. Scores live, analyses IA, Vodacom Ligue 1 RDC, Premier League, Ligue 1, CAF Champions League.",
  keywords: "pronostics foot, scores live, football RDC, Congo, Vodacom Ligue, pronos IA",
  openGraph: {
    title: "live.cd — Pronos Foot IA",
    description: "Pronostics football IA, scores en direct RDC et monde",
    url: "https://live.cd",
    siteName: "live.cd",
    locale: "fr_CD",
    type: "website",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://live.cd" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}