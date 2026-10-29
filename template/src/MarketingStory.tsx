import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ClaudeMark } from "./AdEdit";

/* Story/Reel de marketing do Editor Fit com IA (exclusivo personais e nutris): 3 passos + oferta.
   Vídeos sem áudio; só SFX nas trocas de passo. 9:16, 1080x1920. */

export const MS_FPS = 30;
export const MS_DURATION = Math.ceil(25.1 * MS_FPS);

const C = { bg: "#0b0b12", text: "#fff", accent: "#ffd400", claude: "#d97757", muted: "#9aa0b4", green: "#30c48d" };
const FONT = '"Arial Black", Helvetica, Arial, sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

const STEPS = [
  { a: 0, b: 5.2, n: "PASSO 1", title: "Grave um vídeo curto", sub: "igual esse aqui 👆", chips: [] as string[] },
  { a: 5.2, b: 10.4, n: "PASSO 2", title: "Peça pro Claude editar", sub: "", chips: ["📊 gráficos", "🔥 calorias", "💬 legendas"] },
  { a: 10.4, b: 15.7, n: "PASSO 3", title: "Baixe e poste", sub: "", chips: ["📲 Reels", "TikTok", "Stories"] },
];
const END = 15.7;
const SFX = [{ at: 5.2, f: "pop", v: 0.3 }, { at: 10.4, f: "pop", v: 0.3 }, { at: END, f: "whoosh", v: 0.3 }];
const VO = [{ at: 0.1, f: "vohook" }, { at: 15.8, f: "vo4" }];

/* Zona segura de anúncio Reels/Stories: ~270 px livres no topo, ~670 px embaixo, 65 px nas laterais. */

const StepCard: React.FC<{ s: (typeof STEPS)[number]; t: number }> = ({ s, t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = spring({ frame: frame - Math.round(s.a * MS_FPS), fps, config: { damping: 13, stiffness: 140 } });
  const o = interpolate(t, [s.a, s.a + 0.2, s.b - 0.2, s.b], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 65, right: 65, top: 1030, opacity: o, transform: `scale(${0.9 + 0.1 * sc})`, background: "#161622", borderRadius: 40, border: `5px solid ${C.claude}`, padding: "20px 30px", textAlign: "center", fontFamily: FONT }}>
      <div style={{ fontSize: 30, color: C.claude }}>{s.n}</div>
      <div style={{ fontSize: 50, color: C.text, lineHeight: 1.1, marginTop: 4 }}>{s.title}</div>
      {s.sub ? <div style={{ fontSize: 34, color: C.accent, marginTop: 10 }}>{s.sub}</div> : null}
      {s.chips.length ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 14 }}>
          {s.chips.map((c) => (
            <div key={c} style={{ background: C.accent, color: C.bg, fontSize: 28, padding: "8px 20px", borderRadius: 999 }}>{c}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const MarketingStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / MS_FPS;

  const titleO = interpolate(t, [0, 0.3, 2.1, 2.5], [0, 1, 1, 0.0], clamp);
  const cardO = interpolate(t, [END - 0.2, END + 0.3], [1, 0], clamp);
  const endO = interpolate(t, [END, END + 0.4], [0, 1], clamp);
  const endSc = spring({ frame: frame - Math.round(END * MS_FPS), fps, config: { damping: 12, stiffness: 120 } });
  const bounce = Math.sin(frame / 4) * 14;
  const inStep1 = t < STEPS[1].a;
  const inStep2 = t >= STEPS[1].a && t < STEPS[2].a;

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      {/* selo fixo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 275, display: "flex", justifyContent: "center", opacity: 1 - endO }}>
        <div style={{ background: C.accent, color: C.bg, fontSize: 30, padding: "10px 28px", borderRadius: 999 }}>EXCLUSIVO PARA PERSONAIS E NUTRIS</div>
      </div>
      <div style={{ position: "absolute", left: 65, right: 65, top: 350, textAlign: "center", fontSize: 50, lineHeight: 1.08, color: C.text, opacity: (1 - endO) }}>
        Reels fit editados com <span style={{ color: C.claude }}>IA</span>
      </div>

      {/* celular com o vídeo */}
      <div style={{ position: "absolute", left: 375, top: 435, width: 330, height: 587, borderRadius: 40, overflow: "hidden", border: "6px solid #2a2a3c", boxShadow: "0 20px 60px rgba(0,0,0,.6)", opacity: cardO }}>
        {inStep1 ? (
          <OffthreadVideo muted startFrom={90} src={staticFile("editor-fit/ad2717.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%" }} />
        ) : (
          <Sequence from={Math.round((inStep2 ? STEPS[1].a : STEPS[2].a) * MS_FPS)}>
            <OffthreadVideo muted startFrom={inStep2 ? 60 : 420} src={staticFile("editor-fit/ad2717-edit.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%" }} />
          </Sequence>
        )}
        {inStep1 ? (
          <div style={{ position: "absolute", left: 24, top: 24, display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,.55)", padding: "8px 18px", borderRadius: 999, fontSize: 22, color: C.text }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#e5484d", opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0.25 }} /> REC
          </div>
        ) : null}
      </div>

      {STEPS.map((s) => <StepCard key={s.n} s={s} t={t} />)}

      {/* oferta */}
      {endO > 0 ? (
        <div style={{ position: "absolute", left: 65, right: 65, top: 270, height: 980, opacity: endO, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, transform: `scale(${0.9 + 0.1 * endSc})` }}>
          <ClaudeMark size={190} spin={frame * 0.6} />
          <div style={{ fontSize: 56, color: C.text, textAlign: "center", lineHeight: 1.1 }}>EDITOR FIT com <span style={{ color: C.claude }}>IA</span></div>
          <div style={{ fontSize: 140, color: C.accent, lineHeight: 1 }}>R$35</div>
          <div style={{ fontSize: 32, color: C.text }}>Exclusivo para personais e nutris</div>
          <div style={{ background: C.accent, color: C.bg, fontSize: 44, padding: "16px 36px", borderRadius: 999, transform: `scale(${1 + Math.sin(frame / 6) * 0.03})` }}>Clica em SAIBA MAIS</div>
          <div style={{ fontSize: 70, color: C.accent, transform: `translateY(${bounce}px)` }}>↓</div>
        </div>
      ) : null}

      {VO.map((v) => (
        <Sequence key={v.f} from={Math.round(v.at * MS_FPS)} durationInFrames={20 * MS_FPS}>
          <Audio src={staticFile(`editor-fit/${v.f}.wav`)} volume={1} />
        </Sequence>
      ))}

      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * MS_FPS)} durationInFrames={3 * MS_FPS}>
          <Audio src={staticFile(`editor-fit/${s.f}.wav`)} volume={s.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
