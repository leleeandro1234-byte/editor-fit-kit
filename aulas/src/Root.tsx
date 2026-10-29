import React from "react";
import { Composition } from "remotion";
import roteiros from "../roteiros.json";
import durations from "./durations.json";
import { Aula, FPS, PAD, Lesson } from "./Aula";

const dur = (id: string) => (durations as Record<string, number[]>)[id] ?? [];

export const Root: React.FC = () => (
  <>
    {(roteiros as Lesson[]).map((l) => {
      const d = dur(l.id);
      const frames = d.length ? d.reduce((a, s) => a + Math.ceil((s + PAD) * FPS), 0) : 30;
      return <Composition key={l.id} id={l.id} component={Aula} defaultProps={{ lesson: l, durations: d }} durationInFrames={frames} fps={FPS} width={1920} height={1080} />;
    })}
  </>
);
