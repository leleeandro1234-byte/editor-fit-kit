import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import transcript from "./transcript.json";
import { CTA, CTA_AT_SECONDS, EMPHASIS, FPS, HANDLE, VIDEO_FILE } from "./config";

const C = { text: "#fff", accent: "#ffd400", bg: "#0b0b12" };
const FONT = '"Arial Black", Helvetica, Arial, sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Word = { w: string; s: number; e: number };
type Seg = { start: number; end: number; words: Word[] };

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const seg = (transcript as Seg[]).find((s) => t >= s.start && t <= s.end + 0.3);
  if (!seg) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 420, textAlign: "center", fontFamily: FONT, fontSize: 78, lineHeight: 1.1 }}>
      {seg.words.map((w, i) => {
        const on = t >= w.s;
        const emph = EMPHASIS.includes(w.w.toLowerCase().replace(/[.,!?]/g, ""));
        return (
          <span key={i} style={{ color: emph ? C.accent : C.text, opacity: on ? 1 : 0.35, margin: "0 8px", display: "inline-block", WebkitTextStroke: "8px #000", paintOrder: "stroke fill" }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

const Cta: React.FC<{ t: number }> = ({ t }) => {
  const { fps } = useVideoConfig();
  if (t < CTA_AT_SECONDS) return null;
  const s = spring({ frame: (t - CTA_AT_SECONDS) * fps, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 160, textAlign: "center", transform: `scale(${s})`, fontFamily: FONT }}>
      <div style={{ fontSize: 64, color: C.accent, WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>{CTA}</div>
      <div style={{ fontSize: 44, color: C.text, marginTop: 12, WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>{HANDLE}</div>
    </div>
  );
};

export const Starter: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // zoom leve e contínuo para dar ritmo
  const zoom = interpolate(t, [0, 20], [1, 1.08], { ...clamp, easing: Easing.inOut(Easing.ease) });
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <OffthreadVideo src={staticFile(VIDEO_FILE)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <Captions t={t} />
      <Cta t={t} />
    </AbsoluteFill>
  );
};
