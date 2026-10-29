import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const FPS = 30;
export const PAD = 0.9; // respiro depois da fala de cada passo

export type Step = { titulo: string; fala: string; bullets?: string[]; comando?: string; plataforma?: string };
export type Lesson = { id: string; titulo: string; steps: Step[] };

const C = { bg: "#0b0b12", card: "#161622", text: "#ffffff", muted: "#9aa0b4", accent: "#ffd400", green: "#30c48d", blue: "#4c8dff" };
const FONT = '"Arial Black", Helvetica, Arial, sans-serif';
const BODY = 'Helvetica, Arial, sans-serif';
const MONO = '"SF Mono", Menlo, "Courier New", monospace';

const StepScene: React.FC<{ lesson: Lesson; i: number }> = ({ lesson, i }) => {
  const s = lesson.steps[i];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (d: number) => spring({ frame: frame - d, fps, config: { damping: 14 } });
  const fade = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const total = lesson.steps.length;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade, padding: "70px 110px", fontFamily: BODY }}>
      {/* topo: aula + progresso */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: C.muted, fontSize: 30, letterSpacing: 1 }}>{lesson.titulo.toUpperCase()}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {lesson.steps.map((_, k) => (
            <div key={k} style={{ width: 46, height: 10, borderRadius: 5, background: k <= i ? C.accent : "#2a2a3a" }} />
          ))}
        </div>
      </div>

      {/* título do passo */}
      <div style={{ marginTop: 70, transform: `translateY(${(1 - pop(0)) * 40}px)`, opacity: pop(0) }}>
        <div style={{ color: C.accent, fontFamily: FONT, fontSize: 36 }}>PASSO {i + 1} DE {total}</div>
        <div style={{ color: C.text, fontFamily: FONT, fontSize: 88, lineHeight: 1.05, marginTop: 14 }}>{s.titulo}</div>
      </div>

      {/* corpo: comando ou lista */}
      <div style={{ marginTop: 60 }}>
        {s.comando && (
          <div style={{ transform: `scale(${0.9 + 0.1 * pop(12)})`, opacity: pop(12), transformOrigin: "left center" }}>
            {s.plataforma && (
              <div style={{ display: "inline-block", background: C.blue, color: "#fff", fontFamily: FONT, fontSize: 30, padding: "8px 24px", borderRadius: 12, marginBottom: 18 }}>
                {s.plataforma}
              </div>
            )}
            <div style={{ background: "#000", border: `3px solid ${C.green}`, borderRadius: 20, padding: "36px 44px", fontFamily: MONO, fontSize: 46, color: C.green, lineHeight: 1.3, wordBreak: "break-all" }}>
              <span style={{ color: C.muted }}>$ </span>{s.comando}
            </div>
            <div style={{ color: C.muted, fontSize: 30, marginTop: 18 }}>Copie, cole e aperte Enter</div>
          </div>
        )}
        {s.bullets && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {s.bullets.map((b, k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 24, transform: `translateX(${(1 - pop(10 + k * 8)) * 60}px)`, opacity: pop(10 + k * 8) }}>
                <div style={{ width: 54, height: 54, borderRadius: 27, background: C.green, color: "#0b0b12", fontFamily: FONT, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{k + 1}</div>
                <div style={{ color: C.text, fontSize: 48 }}>{b}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* legenda da narração */}
      <div style={{ position: "absolute", left: 110, right: 110, bottom: 60, background: "rgba(22,22,34,0.92)", borderRadius: 18, padding: "22px 34px", color: C.text, fontSize: 34, lineHeight: 1.35 }}>
        {s.fala}
      </div>
    </AbsoluteFill>
  );
};

export const Aula: React.FC<{ lesson: Lesson; durations: number[] }> = ({ lesson, durations }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {lesson.steps.map((_, i) => {
        const len = Math.ceil(((durations[i] ?? 3) + PAD) * FPS);
        const start = from;
        from += len;
        return (
          <Sequence key={i} from={start} durationInFrames={len}>
            <StepScene lesson={lesson} i={i} />
            <Audio src={staticFile(`audio/${lesson.id}/s${i}.mp3`)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
