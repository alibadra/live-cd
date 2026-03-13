import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "live.cd — Pronos & Scores",
  description: "Pronostics foot IA, scores en direct, actu sport RDC et monde",
  manifest: "/manifest.json",
  themeColor: "#080808",
  viewport: "width=device-width, initial-scale=1.0, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
