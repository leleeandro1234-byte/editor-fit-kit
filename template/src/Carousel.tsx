import { AbsoluteFill } from "remotion";
import { C, FONT, SideA, SideB } from "./ReelAd";

export const CAROUSEL = { width: 1080, height: 1350, total: 7 };
const PAD = 80;

const Shell: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT, padding: PAD }}>
    <div style={{ position: "absolute", left: -120, top: -120, width: 520, height: 520, borderRadius: "50%", background: C.accent, opacity: 0.1, filter: "blur(90px)" }} />
    <div style={{ position: "absolute", right: -140, bottom: -140, width: 560, height: 560, borderRadius: "50%", background: C.green, opacity: 0.1, filter: "blur(90px)" }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
      {children}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: CAROUSEL.total }).map((_, i) => (
          <div key={i} style={{ width: i === n - 1 ? 44 : 14, height: 14, borderRadius: 7, background: i === n - 1 ? C.accent : "#3a3a4d" }} />
        ))}
      </div>
      {n < CAROUSEL.total && <div style={{ color: C.muted, fontSize: 40, fontWeight: 800 }}>ARRASTE ➜</div>}
    </div>
  </AbsoluteFill>
);

const Tag: React.FC<{ children: string }> = ({ children }) => (
  <div style={{ color: C.accent, fontSize: 40, fontWeight: 800, letterSpacing: 6, marginBottom: 20 }}>{children}</div>
);
const H: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 96 }) => (
  <div style={{ color: C.text, fontSize: size, fontWeight: 900, lineHeight: 1.1 }}>{children}</div>
);

export const Slide1: React.FC = () => (
  <Shell n={1}>
    <div style={{ display: "flex", gap: 24, height: 560 }}>
      {[
        { l: "LADO A", c: C.red, el: <SideA /> },
        { l: "LADO B", c: C.green, el: <SideB /> },
      ].map((s) => (
        <div key={s.l} style={{ flex: 1, background: C.card, borderRadius: 32, border: `6px solid ${s.c}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ color: s.c, fontSize: 48, fontWeight: 900, textAlign: "center", padding: "16px 0" }}>{s.l}</div>
          <div style={{ flex: 1 }}>{s.el}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 40 }}>
      <H size={72}>
        Tráfego pago do jeito certo faz o cliente <span style={{ color: C.green }}>vir até você</span>
      </H>
    </div>
  </Shell>
);

export const Slide2: React.FC = () => (
  <Shell n={2}>
    <Tag>VOCÊ VENDE CONSÓRCIO?</Tag>
    <H>
      Você precisa de um <span style={{ color: C.accent }}>processo próprio</span> de captação de leads
    </H>
  </Shell>
);

export const Slide3: React.FC = () => (
  <Shell n={3}>
    <Tag>O PROBLEMA</Tag>
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {["Depender de indicação", "Depender de lista fria"].map((x) => (
        <div key={x} style={{ background: C.card, borderLeft: `12px solid ${C.red}`, borderRadius: 20, padding: "34px 40px", color: C.text, fontSize: 64, fontWeight: 800 }}>
          ✕ {x}
        </div>
      ))}
    </div>
    <div style={{ marginTop: 48 }}>
      <H size={72}>Dá <span style={{ color: C.red }}>mais trabalho</span> do que resultado</H>
    </div>
  </Shell>
);

const Step: React.FC<{ n: number; t: string; d: string }> = ({ n, t, d }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
    <div style={{ width: 150, height: 150, borderRadius: 75, background: C.accent, color: "#000", fontSize: 96, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
    <div>
      <div style={{ color: C.text, fontSize: 76, fontWeight: 900, lineHeight: 1.05 }}>{t}</div>
      <div style={{ color: C.muted, fontSize: 48, fontWeight: 600, marginTop: 12 }}>{d}</div>
    </div>
  </div>
);

export const Slide4: React.FC = () => (
  <Shell n={4}>
    <Tag>O QUE FAZEMOS · PASSO 1</Tag>
    <Step n={1} t="Criamos o anúncio" d="Atrai quem quer consórcio" />
  </Shell>
);
export const Slide5: React.FC = () => (
  <Shell n={5}>
    <Tag>PASSO 2 E 3</Tag>
    <div style={{ display: "flex", flexDirection: "column", gap: 70 }}>
      <Step n={2} t="Formulário de qualificação" d="Entende o momento do lead" />
      <Step n={3} t="Abordagem assertiva" d="Ganha a confiança nas primeiras etapas" />
    </div>
  </Shell>
);
export const Slide6: React.FC = () => (
  <Shell n={6}>
    <Tag>PASSO 4</Tag>
    <Step n={4} t="Fechamento" d="Reunião ou presencial no seu escritório" />
  </Shell>
);

export const Slide7: React.FC = () => (
  <Shell n={7}>
    <div style={{ textAlign: "center" }}>
      <H size={84}>
        Copie essa estrutura em apenas <span style={{ color: C.accent }}>5 passos</span>
      </H>
      <div style={{ display: "inline-block", marginTop: 56, background: C.accent, color: "#000", borderRadius: 40, padding: "20px 80px", fontSize: 170, fontWeight: 900 }}>R$ 17,90</div>
      <div style={{ display: "inline-block", marginTop: 56, background: C.green, color: "#000", borderRadius: 999, padding: "26px 70px", fontSize: 60, fontWeight: 900 }}>
        Clique em “Saiba mais”
      </div>
    </div>
  </Shell>
);

export const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7];
