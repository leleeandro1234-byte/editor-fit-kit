import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import transcript from "./adsTranscript.json";

/* Anúncios curtos do Leandro Marques com o tratamento "Editor Fit": legendas dinâmicas,
   zoom nos pontos de ênfase, painéis divididos com gráfico e CTA final. 9:16, 1080x1920. */

export const AD_FPS = 30;
export const AD_DURATIONS: Record<AdId, number> = { "2714": 20.3, "2715": 20.6, "2717": 22.3 };
export type AdId = "2714" | "2715" | "2717";

const C = { bg: "#0b0b12", card: "#161622", text: "#fff", accent: "#ffd400", red: "#e5484d", green: "#30c48d", blue: "#4c8dff", muted: "#9aa0b4" };
const FONT = '"Arial Black", Helvetica, Arial, sans-serif';
const W = 1080, H = 1920, PANEL_H = 900;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const win = (t: number, a: number, b: number, fade = 0.2) => interpolate(t, [a, a + fade, b - fade, b], [0, 1, 1, 0], clamp);

type Word = { w: string; s: number; e: number };
type Seg = { start: number; end: number; words: Word[] };
type Tag = { a: number; b: number; text: string; color: string; fg?: string };
type Cfg = { split?: { a: number; b: number }; punch: [number, number][]; tags: Tag[]; sfx: { at: number; f: string; v: number }[]; emph: string[]; cta: number; tint?: { a: number; b: number; c: string }[] };

const CFG: Record<AdId, Cfg> = {
  "2714": {
    split: { a: 0.0, b: 15.3 },
    punch: [[0.3, 1.12], [3.4, 1.12], [5.4, 1.12], [8.0, 1.12], [10.6, 1.12], [13.0, 1.12]],
    emph: ["emagrecer", "engordar", "emagrecer.", "engordar."],
    tags: [],
    tint: [
      { a: 0.4, b: 2.9, c: C.green }, { a: 3.3, b: 5.4, c: C.red }, { a: 5.5, b: 8.0, c: C.green },
      { a: 8.1, b: 10.6, c: C.red }, { a: 10.7, b: 12.9, c: C.green }, { a: 13.0, b: 15.2, c: C.red },
    ],
    sfx: [0.4, 3.3, 5.5, 8.1, 10.7, 13.0].map((at, i) => ({ at, f: "pop", v: i % 2 ? 0.45 : 0.6 })).concat([{ at: 15.3, f: "whoosh", v: 0.5 }]),
    cta: 15.3,
  },
  "2715": {
    split: { a: 3.0, b: 8.0 },
    punch: [[0.6, 1.1], [2.0, 1.1], [8.2, 1.12], [10.5, 1.12], [13.0, 1.1]],
    emph: ["amendoim", "big", "mac", "calorias", "emagrecer", "calóricos", "dieta."],
    tags: [
      { a: 8.3, b: 11.8, text: "🍽️ Nem toda caloria é igual", color: C.accent },
      { a: 13.0, b: 15.0, text: "📋 Contabilize na dieta", color: C.green },
    ],
    sfx: [{ at: 2.6, f: "whoosh", v: 0.45 }, { at: 8.0, f: "whoosh", v: 0.35 }, { at: 8.3, f: "pop", v: 0.6 }, { at: 13.0, f: "pop", v: 0.6 }, { at: 18.0, f: "pop", v: 0.7 }],
    cta: 18.1,
  },
  "2717": {
    split: { a: 0.9, b: 19.8 },
    punch: [[0.9, 1.1], [2.4, 1.1], [14.9, 1.12], [17.2, 1.12]],
    emph: ["pace", "velocidade", "10", "km", "50", "minutos,"],
    tags: [],
    sfx: [1.7, 3.3, 6.0, 7.6, 10.7, 12.9].map((at) => ({ at, f: "pop", v: 0.5 })).concat([{ at: 14.5, f: "whoosh", v: 0.45 }, { at: 19.8, f: "pop", v: 0.7 }]),
    cta: 19.9,
  },
};

/* ---------- painéis ---------- */

const Bar: React.FC<{ t: number; at: number; v: number; max: number; color: string; y: number; label: string }> = ({ t, at, v, max, color, y, label }) => {
  const k = interpolate(t, [at, at + 1.2], [0, 1], { ...clamp, easing: ease });
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: y, fontFamily: FONT, fontSize: 48, color: C.text }}>{label}</div>
      <div style={{ position: "absolute", left: 90, top: y + 70, width: 900, height: 70, background: "#232336", borderRadius: 18, overflow: "hidden" }}>
        <div style={{ width: `${(v / max) * 100 * k}%`, height: "100%", background: color, borderRadius: 18 }} />
        <div style={{ position: "absolute", left: 24, top: 0, height: 70, display: "flex", alignItems: "center", fontFamily: FONT, fontSize: 38, color: C.text, textShadow: "0 2px 6px rgba(0,0,0,.55)" }}>
          🔥 {Math.round(v * k)} kcal
        </div>
      </div>
    </>
  );
};

const CalPanel: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.card}, #1d1020)` }}>
    <div style={{ position: "absolute", left: 90, right: 90, top: 110, fontFamily: FONT, fontSize: 56, lineHeight: 1.1, color: C.accent }}>Calorias em 100 g</div>
    <Bar t={t} at={3.9} v={590} max={650} color={C.red} y={260} label="🥜 Amendoim" />
    <Bar t={t} at={4.4} v={235} max={650} color={C.green} y={520} label="🍔 Big Mac" />
    <div style={{ position: "absolute", left: 90, top: 790, fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: 34, color: C.accent }}>
      Exemplo ilustrativo <span style={{ color: C.muted, fontWeight: 400 }}>· valores aproximados</span>
    </div>
  </AbsoluteFill>
);

const PacePanel: React.FC<{ t: number }> = ({ t }) => {
  const k = interpolate(t, [15.3, 16.4], [0, 1], { ...clamp, easing: ease });
  const box = (big: string, small: string, color: string, fg: string, dx: number) => (
    <div style={{ width: 440, padding: "34px 0", background: color, color: fg, borderRadius: 28, textAlign: "center", fontFamily: FONT, transform: `translateX(${dx * (1 - k)}px)`, opacity: k }}>
      <div style={{ fontSize: 100 }}>{big}</div>
      <div style={{ fontSize: 36 }}>{small}</div>
    </div>
  );
  const r = interpolate(t, [17.4, 18.4], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #10192a, #161622)", alignItems: "center", justifyContent: "center", gap: 34, paddingTop: 40 }}>
      <div style={{ fontFamily: FONT, fontSize: 64, color: C.accent, textAlign: "center" }}>10 km em menos de 50 min</div>
      <div style={{ display: "flex", gap: 30 }}>
        {box("12", "km/h na esteira", C.accent, "#0b0b12", -80)}
        {box("5:00", "min por km (pace)", C.blue, "#fff", 80)}
      </div>
      <div style={{ fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: 32, color: C.muted, opacity: r }}>
        Ritmo médio necessário · 50 ÷ 10 = 5:00 /km
      </div>
    </AbsoluteFill>
  );
};

const Dotted: React.FC<{ top: number; height: number }> = ({ top, height }) => (
  <div style={{ position: "absolute", left: 538, top, height, width: 0, borderLeft: "6px dotted rgba(255,255,255,.55)" }} />
);

const pulse = (t: number, times: number[]) => {
  let m = 0;
  for (const a of times) if (t >= a) m = Math.max(m, Math.exp(-(t - a) * 7) * Math.cos((t - a) * 14));
  return 1 + 0.1 * m;
};

type Item = { e: string; n: string; k: string; at: number };
const ROWS: { l: Item; r: Item }[] = [
  { l: { e: "🥤", n: "Coca Zero", k: "0 kcal · 350 ml", at: 0.4 }, r: { e: "🥤", n: "Coca normal", k: "~150 kcal · 350 ml", at: 3.3 } },
  { l: { e: "🥚", n: "Ovo", k: "~155 kcal · 100 g", at: 5.5 }, r: { e: "🧈", n: "Manteiga", k: "~720 kcal · 100 g", at: 8.1 } },
  { l: { e: "🍠", n: "Batata doce", k: "~85 kcal · 100 g", at: 10.7 }, r: { e: "🍟", n: "Batata frita", k: "~310 kcal · 100 g", at: 13.0 } },
];

const FatPanel: React.FC<{ t: number }> = ({ t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = (it: Item, x: number, y: number, color: string) => {
    const sc = spring({ frame: frame - Math.round(it.at * AD_FPS), fps, config: { damping: 12, stiffness: 140 } });
    if (t < it.at) return null;
    return (
      <div style={{ position: "absolute", left: x, top: y, width: 450, height: 180, borderRadius: 26, background: "#1f1f31", border: `4px solid ${color}`, transform: `scale(${sc})`, display: "flex", alignItems: "center", gap: 18, padding: "0 20px" }}>
        <div style={{ fontSize: 78 }}>{it.e}</div>
        <div style={{ fontFamily: FONT, color: C.text, lineHeight: 1.15 }}>
          <div style={{ fontSize: 38 }}>{it.n}</div>
          <div style={{ fontSize: 28, color }}>{it.k}</div>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #14141f, #1a1424)" }}>
      <div style={{ position: "absolute", left: 45, width: 450, top: 40, textAlign: "center", fontFamily: FONT, fontSize: 40, lineHeight: 1.1, color: C.red }}>❌ AJUDA A<br />ENGORDAR</div>
      <div style={{ position: "absolute", left: 585, width: 450, top: 40, textAlign: "center", fontFamily: FONT, fontSize: 40, lineHeight: 1.1, color: C.green }}>✅ AJUDA A<br />EMAGRECER</div>
      <Dotted top={30} height={840} />
      {ROWS.map((r, i) => (
        <React.Fragment key={i}>
          {card(r.l, 585, 200 + i * 205, C.green)}
          {card(r.r, 45, 200 + i * 205, C.red)}
        </React.Fragment>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 842, textAlign: "center", fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: 28, color: C.accent }}>
        Exemplo ilustrativo <span style={{ color: C.muted, fontWeight: 400 }}>· valores aproximados</span>
      </div>
    </AbsoluteFill>
  );
};

// Cada repetição do apresentador mostra um par compatível pace ↔ velocidade (pace em min/km, velocidade = 60 / pace).
const CYCLES = [
  { p: 1.7, v: 3.3, pace: "6:00", kmh: "10" },
  { p: 6.0, v: 7.6, pace: "5:00", kmh: "12" },
  { p: 10.7, v: 12.9, pace: "4:00", kmh: "15" },
];

const PaceLive: React.FC<{ t: number }> = ({ t }) => {
  let ci = -1;
  CYCLES.forEach((c, i) => { if (t >= c.p) ci = i; });
  const c = CYCLES[Math.max(0, ci)];
  const kp = ci < 0 ? 0 : interpolate(t, [c.p, c.p + 0.3], [0, 1], clamp);
  const kv = ci < 0 ? 0 : interpolate(t, [c.v, c.v + 0.3], [0, 1], clamp);
  const ps = pulse(t, [c.p]);
  const vs = pulse(t, [c.v]);
  const col = (x: number, label: string, big: string, unit: string, color: string, fg: string, k: number, sc: number) => (
    <div style={{ position: "absolute", left: x, width: 450, top: 170, height: 520, borderRadius: 32, background: color, color: fg, fontFamily: FONT, textAlign: "center", opacity: k, transform: `scale(${sc * (0.9 + 0.1 * k)})`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontSize: 44 }}>{label}</div>
      <div style={{ fontSize: 150, lineHeight: 1.1 }}>{big}</div>
      <div style={{ fontSize: 42 }}>{unit}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #10192a, #161622)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontFamily: FONT, fontSize: 44, color: C.accent }}>Esteira</div>
      <Dotted top={110} height={720} />
      {col(45, "⚡ VELOCIDADE", c.kmh, "km/h", C.accent, "#0b0b12", kv, vs)}
      {col(585, "⏱️ PACE", c.pace, "min por km", C.blue, "#fff", kp, ps)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: 30, color: C.muted, opacity: kv }}>
        Exemplo ilustrativo
      </div>
    </AbsoluteFill>
  );
};

/* ---------- composição ---------- */

const BAND = 300;

export const ClaudeMark: React.FC<{ size: number; spin: number }> = ({ size, spin }) => {
  const lens = [1, 0.72, 0.95, 0.66, 1, 0.78, 0.92, 0.7, 1, 0.74, 0.96, 0.68];
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ transform: `rotate(${spin}deg)` }}>
      {lens.map((l, i) => (
        <line key={i} x1={0} y1={0} x2={0} y2={-92 * l} stroke="#d97757" strokeWidth={17} strokeLinecap="round" transform={`rotate(${i * 30})`} />
      ))}
      <circle r={16} fill="#d97757" />
    </svg>
  );
};

export const AdEdit: React.FC<{ id: AdId; band?: boolean }> = ({ id, band }) => {
  const B = band ? BAND : 0;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / AD_FPS;
  const cfg = CFG[id];
  const segs = (transcript as Record<string, Seg[]>)[id];

  const p = cfg.split ? interpolate(t, [cfg.split.a - 0.45, cfg.split.a, cfg.split.b, cfg.split.b + 0.4], [0, 1, 1, 0], { ...clamp, easing: ease }) : 0;
  const boxTop = PANEL_H * p;

  // zoom: leve deriva + punch-ins nos pontos de ênfase
  const bump = Math.max(1, ...cfg.punch.map(([a, z]) => interpolate(t, [a, a + 0.5, a + 2.0, a + 2.4], [1, z, z, 1], { ...clamp, easing: ease })));
  const zoom = bump * (1 + 0.02 * (t / 20));

  // legendas em blocos de 3 palavras
  const chunks: { s: number; e: number; words: Word[] }[] = [];
  for (const sg of segs) {
    let cur: Word[] = [];
    for (const w of sg.words) {
      cur.push(w);
      if (cur.length >= 3 || /[.,!?]$/.test(w.w)) { chunks.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur }); cur = []; }
    }
    if (cur.length) chunks.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur });
  }
  const ci = chunks.findIndex((c, i) => t >= c.s - 0.05 && t < (chunks[i + 1]?.s ?? c.e + 1));
  const ch = ci >= 0 && t <= chunks[ci].e + 0.6 && t < cfg.cta ? chunks[ci] : null;

  const tint = cfg.tint?.find((x) => t >= x.a && t <= x.b);
  const ctaO = interpolate(t, [cfg.cta, cfg.cta + 0.4], [0, 1], clamp);
  const bounce = Math.sin(frame / 4) * 14;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {cfg.split && p > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_H, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${-(1 - p) * PANEL_H}px)` }}>
            {id === "2715" ? <CalPanel t={t} /> : id === "2714" ? <FatPanel t={t} /> : t < 14.6 ? <PaceLive t={t} /> : <PacePanel t={t} />}
          </div>
        </div>
      ) : null}

      <div style={{ position: "absolute", left: 0, top: boxTop, width: W, height: H - boxTop - B, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 40%" }}>
          <OffthreadVideo src={staticFile(`editor-fit/ad${id}.mp4`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%" }} />
        </div>
      </div>

      {tint ? <AbsoluteFill style={{ boxShadow: `inset 0 0 0 10px ${tint.c}, inset 0 0 140px ${tint.c}66`, pointerEvents: "none" }} /> : null}

      {cfg.tags.map((g) => {
        const o = win(t, g.a, g.b, 0.2);
        if (o <= 0) return null;
        const sc = spring({ frame: frame - Math.round(g.a * AD_FPS), fps, config: { damping: 12, stiffness: 140 } });
        return (
          <div key={g.a} style={{ position: "absolute", left: 0, right: 0, top: p > 0.5 ? 940 : 170, display: "flex", justifyContent: "center", opacity: o, transform: `scale(${sc})` }}>
            <div style={{ background: g.color, color: g.fg ?? "#0b0b12", fontFamily: FONT, fontSize: 56, padding: "18px 42px", borderRadius: 999, boxShadow: "0 10px 30px rgba(0,0,0,.45)" }}>{g.text}</div>
          </div>
        );
      })}

      {ch ? (
        <div style={{ position: "absolute", left: 50, right: 50, bottom: 150 + B, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 26px" }}>
          {ch.words.map((w, i) => {
            const on = t >= w.s - 0.02 && t < w.e + 0.05;
            const em = cfg.emph.includes(w.w.toLowerCase());
            return (
              <span key={i} style={{ fontFamily: FONT, fontSize: em ? 68 : 58, color: on || em ? C.accent : C.text, transform: `scale(${on ? 1.06 : 1})`, display: "inline-block", WebkitTextStroke: "5px #000", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(0,0,0,.6)" }}>
                {w.w}
              </span>
            );
          })}
        </div>
      ) : null}

      {id !== "2715" && !band ? (
        <>
          {!band ? <div style={{ position: "absolute", left: 40, right: 40, top: 910, textAlign: "center", fontFamily: FONT, fontSize: 40, lineHeight: 1.15, color: C.text, WebkitTextStroke: "5px #000", paintOrder: "stroke fill" }}>
            NUTRI / PERSONAL<br /><span style={{ color: C.accent }}>Edite Reels em 2 minutos</span>
          </div> : null}
          <div style={{ position: "absolute", left: 0, right: 0, top: 1490 - B, display: "flex", justifyContent: "center", opacity: Math.floor(frame / 18) % 2 === 0 ? 1 : 0.15 }}>
            <div style={{ background: C.accent, color: "#0b0b12", fontFamily: FONT, fontSize: 42, padding: "10px 26px", borderRadius: 18, boxShadow: "0 10px 30px rgba(0,0,0,.55)" }}>EDITOR FIT COM IA</div>
          </div>
        </>
      ) : null}

      {ctaO > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 150 + B, opacity: ctaO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {id === "2714" ? (
            <div style={{ fontFamily: FONT, fontSize: 52, color: C.text, WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>SIGA</div>
          ) : null}
          <div style={{ background: C.accent, color: "#0b0b12", fontFamily: FONT, fontSize: id === "2714" ? 42 : 70, padding: "22px 40px", borderRadius: 999, boxShadow: "0 12px 34px rgba(0,0,0,.5)", transform: `scale(${1 + Math.sin(frame / 6) * 0.03})`, textAlign: "center" }}>
            {id === "2714" ? "@personaleandromarques.nutri" : "Clique em SAIBA MAIS"}
          </div>
          {id !== "2715" ? <div style={{ fontFamily: FONT, fontSize: 30, color: C.text, WebkitTextStroke: "5px #000", paintOrder: "stroke fill" }}>(EDITOR FIT COM IA - CLICA EM SAIBA MAIS)</div> : null}
          {id !== "2714" ? <div style={{ fontFamily: FONT, fontSize: 90, color: C.accent, transform: `translateY(${bounce}px)`, WebkitTextStroke: "5px #000", paintOrder: "stroke fill" }}>↓</div> : null}
        </div>
      ) : null}

      {band ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BAND, background: C.bg, borderTop: "6px solid #d97757", display: "flex", alignItems: "center", justifyContent: "center", gap: 36, padding: "0 50px" }}>
          <ClaudeMark size={150} spin={frame * 0.6} />
          <div style={{ fontFamily: FONT, color: C.text, lineHeight: 1.2 }}>
            <div style={{ fontSize: 50 }}>EDITOR FIT com <span style={{ color: "#d97757" }}>CLAUDE</span></div>
            <div style={{ fontSize: 56, color: C.accent }}>por R$35</div>
            <div style={{ fontSize: 34, color: C.muted }}>clica em SAIBA MAIS ↓</div>
          </div>
        </div>
      ) : null}

      {cfg.sfx.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * AD_FPS)} durationInFrames={Math.round(3 * AD_FPS)}>
          <Audio src={staticFile(`editor-fit/${s.f}.wav`)} volume={s.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
