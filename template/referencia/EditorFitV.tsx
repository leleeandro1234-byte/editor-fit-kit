import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import transcript from "./editorFitTranscript.json";

/* Versão 9:16 (1080x1920) da edição "Editor Fit com IA". Mesma linha do tempo da
   versão 16:9: cada efeito entra no segundo em que o apresentador o pede. */

export const EFV_FPS = 30;
export const EFV_DURATION = Math.ceil(122.88 * EFV_FPS);

const C = {
  bg: "#0b0b12",
  card: "#161622",
  text: "#ffffff",
  accent: "#ffd400",
  red: "#e5484d",
  green: "#30c48d",
  blue: "#4c8dff",
  muted: "#9aa0b4",
};
const FONT = '"Arial Black", Helvetica, Arial, sans-serif';
const W = 1080;
const H = 1920;
const PANEL_H = 900;

type Seg = { start: number; end: number; text: string; words: { w: string; s: number; e: number }[] };
const SEGS = transcript as Seg[];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const useT = () => useCurrentFrame() / EFV_FPS;
const win = (t: number, a: number, b: number, fade = 0.25) =>
  interpolate(t, [a, a + fade, b - fade, b], [0, 1, 1, 0], clamp);

/* ---------- zoom (punch-ins mais leves: o vertical já corta o vídeo em ~1,8x) ---------- */

const PUNCH: [number, number][] = [
  [0, 1],
  [43.4, 1], [44.0, 1.12], [45.3, 1.12], [45.7, 1],
  [47.6, 1], [48.1, 1.2], [49.3, 1.2], [49.8, 1],
  [67.9, 1], [68.4, 1.22], [69.4, 1.22], [69.9, 1],
  [74.9, 1], [77.5, 1.08], [77.9, 1],
  [93.9, 1], [94.2, 1.1], [95.5, 1.1], [95.9, 1],
  [200, 1],
];

const zoomAt = (t: number) => {
  const seg = SEGS.find((s) => t >= s.start && t <= s.end + 0.3);
  let drift = 1;
  if (seg) {
    const p = (t - seg.start) / Math.max(0.5, seg.end - seg.start);
    drift = 1 + 0.03 * Math.min(1, Math.max(0, p));
  }
  const punch = interpolate(
    t,
    PUNCH.map((k) => k[0]),
    PUNCH.map((k) => k[1]),
    { ...clamp, easing: ease },
  );
  return drift * punch;
};

/* ---------- telas divididas ---------- */

type Split = { a: number; b: number; kind: "intro" | "mcd" | "info" | "split" | "color" };
const SPLITS: Split[] = [
  { a: 0.0, b: 5.0, kind: "intro" },
  { a: 17.4, b: 33.0, kind: "mcd" },
  { a: 50.2, b: 53.3, kind: "info" },
  { a: 65.6, b: 67.5, kind: "split" },
  { a: 83.3, b: 88.6, kind: "color" },
];
const splitAt = (t: number) => {
  for (const s of SPLITS) {
    if (t >= s.a - 0.45 && t <= s.b + 0.4) {
      return { s, p: interpolate(t, [s.a - 0.45, s.a, s.b, s.b + 0.4], [0, 1, 1, 0], { ...clamp, easing: ease }) };
    }
  }
  return null;
};

const Pill: React.FC<{ children: React.ReactNode; color: string; delay: number; size?: number }> = ({
  children,
  color,
  delay,
  size = 54,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 140 } });
  return (
    <div
      style={{
        transform: `scale(${sc})`,
        background: color,
        color: "#0b0b12",
        fontFamily: FONT,
        fontSize: size,
        padding: "18px 44px",
        borderRadius: 999,
        boxShadow: "0 10px 30px rgba(0,0,0,.4)",
      }}
    >
      {children}
    </div>
  );
};

// Valores aproximados (bases públicas; sem tabela oficial do McDonald's Brasil):
// Big Mac ~499 kcal / ~1.010 mg de sódio; Coca 350 ml ~154 kcal / ~18 mg; Coca Zero 350 ml 0 kcal / ~40 mg.
const MCD = {
  normal: { label: "🍔 + 🥤 Coca normal", kcal: 653, na: 1028, color: C.red, at: 25.4 },
  zero: { label: "🍔 + 🥤 Coca Zero", kcal: 499, na: 1050, color: C.green, at: 28.5 },
};
const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");

const Bar: React.FC<{ t: number; at: number; value: number; max: number; unit: string; icon: string; color: string; y: number }> = ({
  t, at, value, max, unit, icon, color, y,
}) => {
  const k = interpolate(t, [at, at + 1.3], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", left: 90, top: y, width: 900, height: 62, background: "#232336", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100 * k}%`, height: "100%", background: color, borderRadius: 16 }} />
      <div style={{ position: "absolute", left: 22, top: 0, height: 62, display: "flex", alignItems: "center", fontFamily: FONT, fontSize: 34, color: C.text, opacity: k > 0.05 ? 1 : 0, textShadow: "0 2px 6px rgba(0,0,0,.55)" }}>
        {icon} {fmt(value * k)} {unit}
      </div>
    </div>
  );
};

const McdPanel: React.FC = () => {
  const t = useT();
  const block = (r: typeof MCD.normal, y: number) => (
    <>
      <div style={{ position: "absolute", left: 90, top: y, fontFamily: FONT, fontSize: 46, color: C.text }}>{r.label}</div>
      <Bar t={t} at={r.at} value={r.kcal} max={700} unit="kcal" icon="🔥" color={r.color} y={y + 70} />
      <Bar t={t} at={r.at + 0.3} value={r.na} max={1200} unit="mg sódio" icon="🧂" color={C.blue} y={y + 148} />
    </>
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.card}, #1d1020)` }}>
      <div style={{ position: "absolute", left: 90, right: 90, top: 120, fontFamily: FONT, fontSize: 50, lineHeight: 1.1, color: C.accent }}>
        Lanche do McDonald's + bebida 350 ml
      </div>
      {block(MCD.normal, 270)}
      {block(MCD.zero, 520)}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 810,
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 700,
          fontSize: 34,
          color: C.accent,
          opacity: interpolate(t, [18.2, 18.8], [0, 1], clamp),
        }}
      >
        Exemplo ilustrativo <span style={{ color: C.muted, fontWeight: 400 }}>· valores aproximados</span>
      </div>
    </AbsoluteFill>
  );
};

const InfoPanel: React.FC = () => {
  const items = [
    ["🥗", "Receitas", C.green],
    ["📊", "Macros", C.blue],
    ["📋", "Cardápio", C.accent],
  ] as const;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.card}, #101a2a)`, alignItems: "center", justifyContent: "center", gap: 44, paddingTop: 80 }}>
      {items.map(([e, label, color], i) => (
        <Pill key={label} color={color} delay={Math.round((50.3 + i * 0.35) * EFV_FPS)} size={70}>
          {e} {label}
        </Pill>
      ))}
    </AbsoluteFill>
  );
};

const SplitPanel: React.FC = () => {
  const t = useT();
  const k = interpolate(t, [65.6, 66.2], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: C.card, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
      <div style={{ display: "flex", gap: 24 * k, alignItems: "center" }}>
        <div style={{ width: 280, height: 360, background: C.blue, borderRadius: 24, transform: `translateX(${-60 * (1 - k)}px)` }} />
        <div style={{ width: 280, height: 360, background: C.accent, borderRadius: 24, transform: `translateX(${60 * (1 - k)}px)` }} />
      </div>
      <div style={{ position: "absolute", bottom: 60, fontFamily: FONT, fontSize: 60, color: C.text }}>Tela dividida</div>
    </AbsoluteFill>
  );
};

const ColorPanel: React.FC = () => {
  const t = useT();
  const k = interpolate(t, [83.4, 85.2], [0, 1], { ...clamp, easing: ease });
  const R = 130;
  const circ = 2 * Math.PI * R;
  const parts = [
    { v: 0.4, c: C.green, label: "Proteínas" },
    { v: 0.35, c: C.accent, label: "Carboidratos" },
    { v: 0.25, c: C.red, label: "Gorduras" },
  ];
  let acc = 0;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #1a1030, #0e2a2a)", alignItems: "center", justifyContent: "center", gap: 36, paddingTop: 110 }}>
      <svg width={320} height={320} viewBox="-160 -160 320 320" style={{ transform: "rotate(-90deg)" }}>
        {parts.map((p) => {
          const len = circ * p.v * k;
          const off = -circ * acc * k;
          acc += p.v;
          return <circle key={p.label} r={R} fill="none" stroke={p.c} strokeWidth={52} strokeDasharray={`${len} ${circ}`} strokeDashoffset={off} />;
        })}
      </svg>
      <div style={{ fontFamily: FONT, fontSize: 46, color: C.text, display: "flex", gap: 36 }}>
        {parts.map((p) => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: p.c }} />
            {p.label}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const ClaudeMark: React.FC<{ size: number; spin: number }> = ({ size, spin }) => {
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

const IntroPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 3, fps, config: { damping: 11, stiffness: 120 } });
  const title = spring({ frame: frame - 12, fps, config: { damping: 12, stiffness: 120 } });
  const sub = interpolate(frame, [30, 42], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #1c1410, #2a1a14)", alignItems: "center", justifyContent: "center", paddingTop: 20 }}>
      <div style={{ transform: `scale(${logo})` }}>
        <ClaudeMark size={230} spin={frame * 0.6} />
      </div>
      <div style={{ transform: `scale(${title})`, fontFamily: FONT, fontSize: 118, lineHeight: 1.02, color: C.text, textAlign: "center", marginTop: 34 }}>
        EDITOR FIT
        <br />
        <span style={{ color: C.accent }}>COM IA</span>
      </div>
      <div style={{ opacity: sub, fontFamily: FONT, fontSize: 40, color: "#d97757", marginTop: 26 }}>editado com o Claude</div>
    </AbsoluteFill>
  );
};

const PanelFor: React.FC<{ kind: Split["kind"] }> = ({ kind }) =>
  kind === "intro" ? <IntroPanel /> : kind === "mcd" ? <McdPanel /> : kind === "info" ? <InfoPanel /> : kind === "split" ? <SplitPanel /> : <ColorPanel />;

/* ---------- tags de efeito ---------- */

const TAGS: { at: number; until: number; text: string; color: string }[] = [
  { at: 60.4, until: 62.4, text: "Editor Fit com IA", color: C.accent },
  { at: 63.4, until: 65.4, text: "📊 Elementos gráficos", color: C.green },
  { at: 68.1, until: 69.6, text: "🔍 Zoom +", color: C.blue },
  { at: 69.6, until: 71.0, text: "🔍 Zoom −", color: C.blue },
  { at: 71.0, until: 73.8, text: "💥 Efeito de ação", color: C.red },
  { at: 75.0, until: 77.5, text: "🎬 Suspense", color: C.muted },
  { at: 78.5, until: 82.2, text: "⚫⚪ Preto e branco", color: C.text },
  { at: 94.6, until: 98.6, text: "✂️ Cortes automáticos", color: C.accent },
];

const TagLayer: React.FC = () => {
  const t = useT();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {TAGS.map((g) => {
        const o = win(t, g.at, g.until, 0.2);
        if (o <= 0) return null;
        const sc = spring({ frame: frame - Math.round(g.at * EFV_FPS), fps, config: { damping: 12, stiffness: 140 } });
        return (
          <div key={g.text} style={{ position: "absolute", left: 50, top: 150, opacity: o, transform: `scale(${sc})`, transformOrigin: "left top" }}>
            <div
              style={{
                background: g.color,
                color: "#0b0b12",
                fontFamily: FONT,
                fontSize: 50,
                padding: "16px 36px",
                borderRadius: 999,
                boxShadow: "0 10px 30px rgba(0,0,0,.45)",
              }}
            >
              {g.text}
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ---------- selo: a comparação das calorias é só um exemplo ---------- */

const IllustrativeNote: React.FC<{ left: number; top: number; size: number }> = ({ left, top, size }) => {
  const t = useT();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = win(t, 40.9, 46.0, 0.25);
  if (o <= 0) return null;
  const sc = spring({ frame: frame - Math.round(40.9 * EFV_FPS), fps, config: { damping: 12, stiffness: 140 } });
  return (
    <div style={{ position: "absolute", left, top, opacity: o, transform: `scale(${sc})`, transformOrigin: "left top" }}>
      <div
        style={{
          background: "rgba(8,12,28,.92)",
          border: `3px solid ${C.accent}`,
          color: C.accent,
          fontFamily: FONT,
          fontSize: size,
          padding: "14px 32px",
          borderRadius: 999,
          boxShadow: "0 10px 30px rgba(0,0,0,.45)",
        }}
      >
        Exemplo ilustrativo
      </div>
    </div>
  );
};

/* ---------- legendas ---------- */

type Word = { w: string; s: number; e: number };
const fix = (words: Word[]): Word[] =>
  words.map((x, i) => {
    const bare = x.w.replace(/[.,!?;:]/g, "");
    const tail = x.w.slice(bare.length);
    const next = (words[i + 1]?.w ?? "").replace(/[.,!?;:]/g, "").toLowerCase();
    let b = bare;
    if (bare.toLowerCase() === "cloud") b = "Claude";
    else if (bare.toLowerCase() === "editor" && next === "fit") b = "Editor";
    else if (bare.toLowerCase() === "fit") b = "Fit";
    else if (bare.toLowerCase() === "ia") b = "IA";
    return { ...x, w: b + tail };
  });

const CHUNKS: { s: number; e: number; words: Word[] }[] = [];
for (const seg of SEGS) {
  const ws = fix(seg.words);
  let cur: Word[] = [];
  for (const w of ws) {
    cur.push(w);
    if (cur.length >= 3 || /[.,!?]$/.test(w.w)) {
      CHUNKS.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur });
      cur = [];
    }
  }
  if (cur.length) CHUNKS.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur });
}

// Trechos em que o apresentador dá instruções ao Claude: legenda vira "prompt" + moldura azul.
const INSTR: [number, number][] = [
  [17.3, 30.0],
  [45.6, 57.4],
  [94.0, 101.2],
  [104.0, 118.4],
];
const inInstr = (t: number) => INSTR.some(([a, b]) => t >= a && t <= b);
const EMPH = new Set(["ênfase", "palavras", "importantes", "500", "calorias", "zoom", "claude"]);

const Captions: React.FC = () => {
  const t = useT();
  if (t > 116.2) return null;
  const idx = CHUNKS.findIndex((c, i) => t >= c.s - 0.05 && t < (CHUNKS[i + 1]?.s ?? c.e + 1));
  if (idx < 0) return null;
  const c = CHUNKS[idx];
  if (t > c.e + 0.6) return null;
  if (inInstr(t)) {
    return (
      <div style={{ position: "absolute", left: 50, right: 50, bottom: 110, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            background: "rgba(8,12,28,.9)",
            border: `3px solid ${C.blue}`,
            borderRadius: 22,
            padding: "22px 34px",
            fontFamily: '"Courier New", Menlo, monospace',
            fontWeight: 700,
            fontSize: 54,
            color: C.text,
            boxShadow: `0 0 40px ${C.blue}66`,
          }}
        >
          <span style={{ color: C.blue }}>› </span>
          {c.words.map((w, i) => {
            const on = t >= w.s - 0.02 && t < w.e + 0.05;
            return (
              <span key={i} style={{ color: on ? C.accent : C.text }}>
                {w.w}{" "}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 110, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 34px" }}>
      {c.words.map((w, i) => {
        const on = t >= w.s - 0.02 && t < w.e + 0.05;
        const em = EMPH.has(w.w.toLowerCase().replace(/[.,!?]/g, ""));
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT,
              fontSize: em ? 92 : 80,
              color: on || em ? C.accent : C.text,
              transform: `scale(${on ? 1.06 : 1})`,
              display: "inline-block",
              WebkitTextStroke: "7px #000",
              paintOrder: "stroke fill",
              textShadow: "0 6px 18px rgba(0,0,0,.6)",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- cena final: tira a imagem, fica a voz ---------- */

const FinalScene: React.FC = () => {
  const t = useT();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = interpolate(t, [113.8, 114.5], [0, 1], clamp);
  if (o <= 0) return null;
  const title = spring({ frame: frame - Math.round(116.4 * EFV_FPS), fps, config: { damping: 11, stiffness: 110 } });
  const cta = interpolate(t, [119.0, 119.5], [0, 1], clamp);
  const bounce = Math.sin(frame / 4) * 14;
  return (
    <AbsoluteFill style={{ opacity: o, background: `radial-gradient(circle at 50% 40%, #1b1b2e, ${C.bg})`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 520, display: "flex", gap: 10, alignItems: "center", height: 200 }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const h = 28 + Math.abs(Math.sin(frame / 5 + i * 0.7)) * 150 * Math.abs(Math.sin(frame / 11 + i));
          return <div key={i} style={{ width: 14, height: h, background: C.accent, borderRadius: 8, opacity: 0.85 }} />;
        })}
      </div>
      <div style={{ transform: `scale(${title})`, fontFamily: FONT, fontSize: 124, color: C.text, textAlign: "center", marginTop: 80, lineHeight: 1.05 }}>
        EDITOR FIT
        <br />
        <span style={{ color: C.accent }}>COM IA</span>
      </div>
      <div style={{ position: "absolute", bottom: 170, left: 0, right: 0, opacity: cta, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ fontFamily: FONT, fontSize: 56, color: C.text, textAlign: "center", lineHeight: 1.1 }}>
          Edição Fit com <span style={{ color: "#d97757" }}>CLAUDE</span>
        </div>
        <div style={{ background: C.accent, color: "#0b0b12", fontFamily: FONT, fontSize: 64, padding: "22px 54px", borderRadius: 999, boxShadow: "0 12px 34px rgba(0,0,0,.5)", transform: `scale(${1 + Math.sin(frame / 6) * 0.03})` }}>
          Clica em SAIBA MAIS
        </div>
        <div style={{ fontSize: 90, color: C.accent, transform: `translateY(${bounce}px)` }}>↓</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- efeitos sonoros ---------- */

const SFX: { at: number; file: string; vol: number }[] = [
  { at: 17.2, file: "whoosh", vol: 0.45 },
  { at: 32.9, file: "whoosh", vol: 0.35 },
  { at: 44.4, file: "pop", vol: 0.6 },
  { at: 49.9, file: "whoosh", vol: 0.4 },
  { at: 60.4, file: "pop", vol: 0.6 },
  { at: 63.4, file: "pop", vol: 0.6 },
  { at: 65.5, file: "whoosh", vol: 0.4 },
  { at: 68.1, file: "pop", vol: 0.6 },
  { at: 69.6, file: "pop", vol: 0.6 },
  { at: 70.8, file: "boom", vol: 0.9 },
  { at: 74.9, file: "suspense", vol: 0.7 },
  { at: 78.3, file: "whoosh", vol: 0.4 },
  { at: 83.3, file: "whoosh", vol: 0.4 },
  { at: 94.6, file: "whoosh", vol: 0.5 },
  { at: 113.7, file: "whoosh", vol: 0.5 },
  { at: 116.4, file: "pop", vol: 0.7 },
];

/* ---------- composição ---------- */

export const EditorFitV: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / EFV_FPS;
  const sp = splitAt(t);
  const p = sp ? sp.p : 0;
  const boxTop = PANEL_H * p;
  const boxH = H - boxTop;

  const kick = t >= 70.8 ? interpolate(t, [70.8, 71.6], [1, 0], clamp) : 0;
  const shakeX = Math.sin(frame * 2.3) * 16 * kick;
  const shakeY = Math.cos(frame * 3.1) * 12 * kick;
  const flash = t >= 70.8 ? interpolate(t, [70.8, 71.2], [0.85, 0], clamp) : 0;
  const vig = win(t, 74.9, 77.8, 0.7);
  const gray = interpolate(t, [78.3, 78.8, 88.6, 89.1], [0, 1, 1, 0], clamp);
  const instr = inInstr(t);

  const z = zoomAt(t);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {sp ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_H, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${-(1 - p) * PANEL_H}px)` }}>
            <PanelFor kind={sp.s.kind} />
          </div>
        </div>
      ) : null}

      <div style={{ position: "absolute", left: 0, top: boxTop, width: W, height: boxH, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${shakeX}px, ${shakeY}px) scale(${z})`,
            transformOrigin: "50% 40%",
            filter: `grayscale(${gray}) contrast(${1 + gray * 0.15})`,
          }}
        >
          <OffthreadVideo src={staticFile("editor-fit/src.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%" }} />
        </div>
      </div>

      {vig > 0 ? (
        <AbsoluteFill
          style={{
            opacity: vig,
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,.88) 100%)",
            mixBlendMode: "multiply",
          }}
        />
      ) : null}
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}

      {instr ? (
        <>
          <AbsoluteFill style={{ boxShadow: `inset 0 0 0 8px ${C.blue}, inset 0 0 120px ${C.blue}55`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 36, display: "flex", justifyContent: "center" }}>
            <div style={{ background: C.blue, color: "#fff", fontFamily: FONT, fontSize: 34, padding: "10px 30px", borderRadius: 999 }}>
              INSTRUÇÃO PARA O CLAUDE
            </div>
          </div>
        </>
      ) : null}
      <TagLayer />
      <IllustrativeNote left={50} top={150} size={48} />
      <Captions />
      <FinalScene />

      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * EFV_FPS)} durationInFrames={Math.round(3.2 * EFV_FPS)}>
          <Audio src={staticFile(`editor-fit/${s.file}.wav`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
