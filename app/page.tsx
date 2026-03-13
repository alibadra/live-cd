"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface TeamData {
  id: number;
  name: string;
  logo: string;
  form: string[];
  str: number;
}

interface Match {
  id: number;
  league: string;
  time: string;
  status: string;
  live: boolean;
  scoreH: number | null;
  scoreA: number | null;
  minute: number | null;
  home: TeamData;
  away: TeamData;
  res: "1" | "N" | "2";
  confiance: number;
  xgH: number;
  xgA: number;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function FormDot({ r }: { r: string }) {
  const cls = r === "W" ? "fw" : r === "D" ? "fdraw" : "fl";
  return <div className={`fd ${cls}`}>{r}</div>;
}

function accCls(res: string) {
  return res === "1" ? "acc-1" : res === "2" ? "acc-2" : "acc-n";
}
function resCls(res: string) {
  return res === "1" ? "r1" : res === "2" ? "r2" : "rn";
}

/* ── Skeleton loader ────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 16px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="pc" style={{ height: 220, opacity: 0.4, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

/* ── Prono Card ─────────────────────────────────────────────────────────── */
function PronoCard({ match, index, featured }: { match: Match; index: number; featured: boolean }) {
  const [iaOpen, setIaOpen] = useState(false);
  const [iaText, setIaText] = useState("");
  const [iaLoaded, setIaLoaded] = useState(false);
  const [gaugeActive, setGaugeActive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGaugeActive(true), 300 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const total = match.home.str + match.away.str;
  const homePct = Math.round((match.home.str / total) * 100);

  async function loadIA() {
    if (iaLoaded) return;
    setIaLoaded(true);
    setIaText("");

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ match }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setIaText((prev) => prev + decoder.decode(value));
    }
  }

  function toggleIA() {
    const next = !iaOpen;
    setIaOpen(next);
    if (next) loadIA();
  }

  function shareWA() {
    const msg = `⚡ *PRONO live.cd*\n\n🏆 ${match.league}\n⚽ *${match.home.name} vs ${match.away.name}*\n🕐 ${match.time}\n\n✅ *Prono : ${match.res} — confiance ${match.confiance}%*\nForce : ${match.home.name} ${match.home.str}% vs ${match.away.name} ${match.away.str}%\n\n${iaText ? iaText.slice(0, 280) + "…" : ""}\n\n📲 Tous les pronos → https://live.cd`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className={`pc${featured ? " feat" : ""} rev`} style={{ animationDelay: `${index * 0.07}s` }}>
      <div className={`acc ${accCls(match.res)}`} />
      {featured && <div className="ribbon">⚡ Vedette</div>}

      <div className="pm">
        <div className="pl">{match.league}</div>
        <div className="pt">
          {match.live ? (
            <span style={{ color: "var(--red)", fontWeight: 700 }}>{match.minute}′ LIVE</span>
          ) : (
            match.time
          )}
        </div>
      </div>

      <div className="pb">
        {/* Équipe domicile */}
        <div className="ts home">
          {match.home.logo && (
            <img src={match.home.logo} alt={match.home.name} width={28} height={28} style={{ objectFit: "contain" }} />
          )}
          <div className="tn">{match.home.name}</div>
          <div className="fr">
            {(match.home.form ?? []).map((r, i) => <FormDot key={i} r={r} />)}
          </div>
        </div>

        {/* Centre : jauge + prono */}
        <div className="vc">
          <div className="vl">{match.live ? `${match.scoreH} - ${match.scoreA}` : "VS"}</div>
          <div className="gauge-wrap">
            <div className="g-track">
              <div className="g-h" style={{ width: gaugeActive ? `${homePct}%` : "0%" }} />
              <div className="g-a" style={{ width: gaugeActive ? `${100 - homePct}%` : "0%" }} />
            </div>
            <div className="g-nums">
              <span className="gnh">{match.home.str}%</span>
              <span className="gna">{match.away.str}%</span>
            </div>
          </div>
          <div className={`pr ${resCls(match.res)}`}>
            <div className="prl">Prono</div>
            <div className="prv">{match.res}</div>
            <div className="prc">{match.confiance}%</div>
          </div>
        </div>

        {/* Équipe extérieure */}
        <div className="ts away">
          {match.away.logo && (
            <img src={match.away.logo} alt={match.away.name} width={28} height={28} style={{ objectFit: "contain" }} />
          )}
          <div className="tn">{match.away.name}</div>
          <div className="fr" style={{ flexDirection: "row-reverse" }}>
            {(match.away.form ?? []).map((r, i) => <FormDot key={i} r={r} />)}
          </div>
        </div>
      </div>

      {/* xG */}
      <div className="xgr">
        <div className="xgl">
          <span>Buts attendus (xG estimés)</span>
          <span className="xgt-tag">IA prédictif</span>
        </div>
        <div className="xg-track">
          <div className="xgh" style={{ width: gaugeActive ? `${match.xgH}%` : "0%" }} />
          <div className="xga" style={{ width: gaugeActive ? `${match.xgA}%` : "0%" }} />
        </div>
        <div className="xg-labs">
          <span className="xg-lh">{match.home.name}</span>
          <span className="xg-la">{match.away.name}</span>
        </div>
      </div>

      {/* IA bar */}
      <div className="ia-bar">
        <button className="ia-btn" onClick={toggleIA}>
          <span>🤖</span>
          <span>Analyse IA complète</span>
          <span className="ia-chip">{iaOpen ? "▲" : "voir"}</span>
        </button>
        <button className="wa-btn" onClick={shareWA}>📱</button>
      </div>

      {/* IA panel */}
      <div className={`ia-panel${iaOpen ? " open" : ""}`}>
        <div className="ia-inner">
          {!iaLoaded && <span style={{ color: "var(--muted)" }}>Chargement de l&apos;analyse…</span>}
          {iaText}
          {iaLoaded && !iaText && <span style={{ color: "var(--muted)" }}>Analyse en cours…</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Page principale ────────────────────────────────────────────────────── */
export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [activeTab, setActiveTab] = useState("Pronos IA");
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMatches(data.matches ?? []);
      setUpdatedAt(data.updatedAt ?? "");
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    const iv = setInterval(fetchMatches, 120_000); // refresh 2 min
    return () => clearInterval(iv);
  }, [fetchMatches]);

  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2600);
  }

  const tabs = ["Pronos IA", "Scores live", "Vodacom Ligue", "CAN 2025", "Ligue 1", "Premier League", "Champions L."];
  const liveMatches = matches.filter((m) => m.live);
  const pronoMatches = matches.filter((m) => !m.live);

  return (
    <>
      <style>{`
        header{position:sticky;top:0;z-index:100;background:rgba(8,8,8,0.93);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 16px;height:54px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:2px;line-height:1}
        .logo em{color:var(--green-b);font-style:normal}
        .hright{display:flex;align-items:center;gap:8px}
        .live-pill{display:flex;align-items:center;gap:5px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.28);color:var(--red);font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:4px 9px;border-radius:4px}
        .live-dot{width:6px;height:6px;background:var(--red);border-radius:50%;animation:blink 1.2s ease-in-out infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
        .icon-btn{width:34px;height:34px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px}
        .tabs{display:flex;gap:6px;padding:12px 16px 0;overflow-x:auto;scrollbar-width:none;position:relative;z-index:1}
        .tabs::-webkit-scrollbar{display:none}
        .tab{flex-shrink:0;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);transition:all .2s;white-space:nowrap}
        .tab.active{background:var(--green);border-color:var(--green);color:#fff}
        .ss{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px 16px 0;position:relative;z-index:1}
        .sc{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:11px 10px;text-align:center}
        .sn{font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--green-b);line-height:1}
        .sl{font-size:10px;color:var(--muted);margin-top:2px}
        .sh{display:flex;align-items:center;justify-content:space-between;padding:18px 16px 10px;position:relative;z-index:1}
        .sh-t{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.5px}
        .sh-b{font-size:10px;color:var(--muted);background:var(--bg3);padding:3px 9px;border-radius:10px;border:1px solid var(--border)}
        .prono-list{display:flex;flex-direction:column;gap:12px;padding:0 16px;position:relative;z-index:1}
        .pc{background:var(--bg2);border:1px solid var(--border);border-radius:18px;overflow:hidden;transition:border-color .2s,transform .15s;position:relative}
        .pc:hover{border-color:rgba(255,255,255,.11);transform:translateY(-1px)}
        .pc.feat{border-color:var(--green);box-shadow:0 0 36px rgba(22,163,74,.1)}
        .acc{height:3px;width:100%}
        .acc-1{background:linear-gradient(90deg,var(--green-b) 0%,rgba(34,197,94,.2) 60%,transparent 100%)}
        .acc-n{background:linear-gradient(90deg,transparent 10%,var(--amber) 50%,transparent 90%)}
        .acc-2{background:linear-gradient(90deg,transparent 0%,rgba(239,68,68,.2) 40%,var(--red) 100%)}
        .ribbon{display:inline-flex;align-items:center;gap:4px;background:var(--green);color:#fff;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:3px 9px;border-radius:3px;position:absolute;top:16px;right:14px}
        .pm{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 0}
        .pl{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;font-weight:500}
        .pt{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);background:var(--bg3);padding:3px 8px;border-radius:6px}
        .pb{display:grid;grid-template-columns:1fr 80px 1fr;align-items:center;gap:4px;padding:12px 14px 10px}
        .ts{display:flex;flex-direction:column;gap:5px}
        .ts.home{align-items:flex-start}
        .ts.away{align-items:flex-end}
        .tn{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.5px;line-height:1}
        .fr{display:flex;gap:3px}
        .fd{width:15px;height:15px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700}
        .fw{background:rgba(34,197,94,.18);color:var(--green-b)}
        .fdraw{background:rgba(245,158,11,.18);color:var(--amber)}
        .fl{background:rgba(239,68,68,.18);color:var(--red)}
        .vc{display:flex;flex-direction:column;align-items:center;gap:8px;padding:0 6px}
        .vl{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim);letter-spacing:1px}
        .gauge-wrap{width:100%;display:flex;flex-direction:column;gap:3px}
        .g-track{width:100%;height:7px;background:var(--bg4);border-radius:4px;overflow:hidden;display:flex}
        .g-h{height:100%;border-radius:4px 0 0 4px;background:var(--green-b);transition:width 1.5s cubic-bezier(.16,1,.3,1)}
        .g-a{height:100%;border-radius:0 4px 4px 0;background:var(--red);transition:width 1.5s cubic-bezier(.16,1,.3,1)}
        .g-nums{width:100%;display:flex;justify-content:space-between}
        .gnh{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--green-b);font-weight:700}
        .gna{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--red);font-weight:700}
        .pr{display:flex;flex-direction:column;align-items:center;gap:2px}
        .prl{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px}
        .prv{font-family:'Bebas Neue',sans-serif;font-size:28px;line-height:1}
        .prc{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;padding:3px 9px;border-radius:6px}
        .r1 .prv{color:var(--green-b)} .r1 .prc{background:rgba(34,197,94,.12);color:var(--green-b)}
        .rn .prv{color:var(--amber)}   .rn .prc{background:rgba(245,158,11,.12);color:var(--amber)}
        .r2 .prv{color:var(--red)}     .r2 .prc{background:rgba(239,68,68,.12);color:var(--red)}
        .xgr{padding:8px 14px 12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:5px}
        .xgl{font-size:10px;color:var(--muted);display:flex;justify-content:space-between;align-items:center}
        .xgt-tag{font-size:9px;letter-spacing:.8px;text-transform:uppercase;color:var(--dim)}
        .xg-track{height:5px;background:var(--bg4);border-radius:3px;overflow:hidden;display:flex}
        .xgh{height:100%;border-radius:3px 0 0 3px;background:var(--green-b);transition:width 1.5s cubic-bezier(.16,1,.3,1)}
        .xga{height:100%;border-radius:0 3px 3px 0;background:var(--red);transition:width 1.5s cubic-bezier(.16,1,.3,1)}
        .xg-labs{display:flex;justify-content:space-between;font-size:10px}
        .xg-lh{color:var(--green-b)} .xg-la{color:var(--red)}
        .ia-bar{border-top:1px solid var(--border);display:flex;align-items:stretch}
        .ia-btn{flex:1;background:none;border:none;padding:11px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;transition:background .15s,color .15s;text-align:left}
        .ia-btn:hover{background:rgba(34,197,94,.05);color:var(--text)}
        .ia-chip{font-size:10px;background:var(--green-glow);color:var(--green-b);padding:2px 7px;border-radius:4px;font-weight:600;margin-left:auto}
        .wa-btn{border-left:1px solid var(--border);border-top:none;border-right:none;border-bottom:none;padding:0 16px;background:none;cursor:pointer;font-size:18px;transition:background .15s}
        .wa-btn:hover{background:rgba(37,211,102,.08)}
        .ia-panel{max-height:0;overflow:hidden;transition:max-height .45s cubic-bezier(.16,1,.3,1)}
        .ia-panel.open{max-height:360px}
        .ia-inner{padding:12px 14px 14px;border-top:1px solid var(--border);font-size:12.5px;line-height:1.8;color:#7a7a7a;white-space:pre-wrap}
        .ml{display:flex;flex-direction:column;gap:6px;padding:0 16px;position:relative;z-index:1}
        .mr{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;display:grid;grid-template-columns:1fr 86px 1fr;align-items:center}
        .mt{font-size:13px;font-weight:500}
        .mt.h{text-align:right} .mt.a{text-align:left}
        .mc{text-align:center}
        .ms{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:var(--green-b)}
        .mtime{font-size:10px;color:var(--red);font-weight:600;margin-top:1px}
        .bnav{position:fixed;bottom:0;left:0;right:0;height:62px;background:rgba(8,8,8,.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--border);display:grid;grid-template-columns:repeat(4,1fr);z-index:100;padding-bottom:env(safe-area-inset-bottom)}
        .ni{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;color:var(--dim);font-size:10px;font-weight:500;border:none;background:none;transition:color .15s}
        .ni.active{color:var(--green-b)}
        .ni-i{font-size:20px;line-height:1}
        .toast{position:fixed;bottom:74px;left:50%;transform:translateX(-50%) translateY(12px);background:var(--bg3);border:1px solid var(--border2);color:var(--text);padding:9px 18px;border-radius:24px;font-size:12.5px;font-weight:500;opacity:0;transition:all .3s cubic-bezier(.16,1,.3,1);pointer-events:none;white-space:nowrap;z-index:200}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
        .rev{opacity:0;transform:translateY(14px);animation:rup .5s cubic-bezier(.16,1,.3,1) forwards}
        @keyframes rup{to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:.7}}
        .empty{text-align:center;padding:40px 16px;color:var(--muted);font-size:14px}
        .err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:16px;margin:0 16px;font-size:13px;color:var(--red)}
        .upd{font-size:10px;color:var(--dim);text-align:center;padding:8px;position:relative;z-index:1}
      `}</style>

      <header>
        <div className="logo">LIVE<em>.</em>CD</div>
        <div className="hright">
          <div className="live-pill"><div className="live-dot" />Live</div>
          <div className="icon-btn">🔔</div>
        </div>
      </header>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t} className={`tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      <div className="ss">
        <div className="sc rev"><div className="sn">{matches.length}</div><div className="sl">Matchs aujourd&apos;hui</div></div>
        <div className="sc rev" style={{ animationDelay: ".06s" }}><div className="sn">{liveMatches.length}</div><div className="sl">En cours</div></div>
        <div className="sc rev" style={{ animationDelay: ".12s" }}><div className="sn">{pronoMatches.length}</div><div className="sl">À venir</div></div>
      </div>

      {/* Matchs live */}
      {liveMatches.length > 0 && (
        <>
          <div className="sh">
            <span className="sh-t">Scores live</span>
            <span className="sh-b">{liveMatches.length} en cours</span>
          </div>
          <div className="ml">
            {liveMatches.map((m) => (
              <div key={m.id} className="mr rev">
                <div className="mt h">{m.home.name}</div>
                <div className="mc">
                  <div className="ms">{m.scoreH}–{m.scoreA}</div>
                  <div className="mtime">{m.minute}′</div>
                </div>
                <div className="mt a">{m.away.name}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pronos */}
      <div className="sh" style={{ marginTop: liveMatches.length > 0 ? 8 : 4 }}>
        <span className="sh-t">Pronostics IA</span>
        <span className="sh-b">Analyse stats + IA</span>
      </div>

      {loading && <Skeleton />}

      {error && (
        <div className="err">
          ⚠️ Erreur API : {error}
          <button onClick={fetchMatches} style={{ marginLeft: 12, color: "var(--green-b)", background: "none", border: "none", cursor: "pointer" }}>Réessayer</button>
        </div>
      )}

      {!loading && !error && pronoMatches.length === 0 && (
        <div className="empty">
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚽</div>
          Aucun match dans nos ligues aujourd&apos;hui.<br />
          <span style={{ fontSize: 12 }}>Reviens demain pour les pronos !</span>
        </div>
      )}

      {!loading && !error && (
        <div className="prono-list">
          {pronoMatches.map((m, i) => (
            <PronoCard key={m.id} match={m} index={i} featured={i === 0} />
          ))}
        </div>
      )}

      {updatedAt && (
        <div className="upd">
          Mis à jour : {new Date(updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Kinshasa" })} (heure de Kin)
        </div>
      )}

      <nav className="bnav">
        {[["⚡","Pronos"],["📺","Live"],["📰","Actu"],["👤","Profil"]].map(([icon, label]) => (
          <button key={label} className={`ni${label === "Pronos" ? " active" : ""}`}>
            <span className="ni-i">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className={`toast${toastVisible ? " show" : ""}`}>{toast}</div>
    </>
  );
}
