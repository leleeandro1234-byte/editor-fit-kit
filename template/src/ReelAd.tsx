import {
  AbsoluteFill,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const C = {
  bg: "#0b0b12",
  text: "#ffffff",
  accent: "#ffd400",
  red: "#e5484d",
  green: "#30c48d",
  muted: "#9aa0b4",
  card: "#161622",
};
const SAFE = { top: 285, bottom: 400, left: 80, right: 120 };
export const FONT = "Helvetica, Arial, sans-serif";
const FPS = 30;

const SCENES = [
  { id: "hook", seconds: 5 },
  { id: "problem", seconds: 7 },
  { id: "process", seconds: 12 },
  { id: "cta", seconds: 7 },
] as const;
export const REEL_DURATION = SCENES.reduce((s, x) => s + Math.round(x.seconds * FPS), 0);

const useIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
};

const Safe: React.FC<{ children: React.ReactNode; center?: boolean }> = ({ children, center = true }) => (
  <AbsoluteFill
    style={{
      paddingTop: SAFE.top,
      paddingBottom: SAFE.bottom,
      paddingLeft: SAFE.left,
      paddingRight: SAFE.right,
      justifyContent: center ? "center" : "flex-start",
      fontFamily: FONT,
    }}
  >
    {children}
  </AbsoluteFill>
);

/* ---------- Personagens (cartoon animado) ---------- */

const Person: React.FC<{ angry?: boolean; shirt: string; hair?: string; talk?: boolean }> = ({
  angry,
  shirt,
  hair = "#2a1d14",
  talk,
}) => {
  const frame = useCurrentFrame();
  const blink = frame % 90 > 84 ? 0.1 : 1;
  const mouth = talk ? 8 + 8 * Math.abs(Math.sin(frame / 4)) : 0;
  return (
    <g>
      <rect x="-95" y="60" width="190" height="240" rx="64" fill={shirt} />
      <rect x="-95" y="60" width="190" height="42" rx="21" fill="#fff" opacity="0.15" />
      <circle cx="0" cy="0" r="74" fill="#f6cfa8" stroke="#1a1a1a" strokeWidth="5" />
      <path d="M-74 -8 Q-64 -86 0 -86 Q64 -86 74 -8 Q42 -52 0 -50 Q-42 -52 -74 -8Z" fill={hair} />
      <ellipse cx="-26" cy="6" rx="8" ry={9 * blink} fill="#1a1a1a" />
      <ellipse cx="26" cy="6" rx="8" ry={9 * blink} fill="#1a1a1a" />
      {angry ? (
        <>
          <path d="M-46 -14 L-12 -2" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" />
          <path d="M46 -14 L12 -2" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" />
          <path d="M-24 44 Q0 26 24 44" stroke="#1a1a1a" strokeWidth="8" fill="none" strokeLinecap="round" />
        </>
      ) : talk ? (
        <ellipse cx="0" cy="38" rx="20" ry={mouth} fill="#7a2c2c" stroke="#1a1a1a" strokeWidth="4" />
      ) : (
        <path d="M-26 32 Q0 58 26 32" stroke="#1a1a1a" strokeWidth="8" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

const Steam: React.FC<{ x: number; delay: number }> = ({ x, delay }) => {
  const frame = useCurrentFrame();
  const t = ((frame + delay) % 40) / 40;
  return (
    <circle cx={x} cy={-70 - t * 70} r={10 + t * 14} fill="#fff" opacity={0.5 * (1 - t)} />
  );
};

export const SideA: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 1.4) * 3;
  const swing = Math.sin(frame / 6) * 10;
  const listWave = Math.sin(frame / 3) * 6;
  return (
    <svg viewBox="-200 -150 400 520" width="100%" height="100%">
      <g transform={`translate(${shake} 0)`}>
        <Person angry shirt="#5b6270" />
        <Steam x={-60} delay={0} />
        <Steam x={60} delay={20} />
        {/* cordão + telefone balançando */}
        <path d="M-48 64 L0 170 L48 64" stroke="#e5484d" strokeWidth="7" fill="none" />
        <g transform={`rotate(${swing} 0 170)`}>
          <rect x="-24" y="168" width="48" height="82" rx="11" fill="#111" stroke="#9aa0b4" strokeWidth="4" />
          <rect x="-18" y="177" width="36" height="60" rx="4" fill="#31344a" />
          <text x="0" y="214" textAnchor="middle" fontSize="26" fill="#e5484d">📵</text>
        </g>
        {/* lista na mão */}
        <g transform={`translate(98 150) rotate(${12 + listWave})`}>
          <rect width="90" height="124" fill="#f5f5f0" stroke="#1a1a1a" strokeWidth="4" />
          {[20, 38, 56, 74, 92, 110].map((y) => (
            <line key={y} x1="12" x2="78" y1={y} y2={y} stroke="#999" strokeWidth="4" />
          ))}
        </g>
        <circle cx="140" cy="262" r="22" fill="#f6cfa8" stroke="#1a1a1a" strokeWidth="4" />
      </g>
      <text x="-130" y="-60" fontSize="46" fill="#e5484d" fontWeight="900" opacity={0.5 + 0.5 * Math.sin(frame / 4)}>
        #$%!
      </text>
    </svg>
  );
};

export const SideB: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bob = Math.sin(frame / 8) * 4;
  const walk = spring({ frame: frame - 25, fps, config: { damping: 15, stiffness: 70 } });
  const clientX = 330 - walk * 195;
  const shakeHands = walk > 0.95 ? Math.sin(frame / 2.5) * 6 : 0;
  const lead = spring({ frame: frame - 40, fps, config: { damping: 8 } });
  return (
    <svg viewBox="-200 -150 400 520" width="100%" height="100%">
      {/* computador com gráfico crescendo */}
      <g transform="translate(-175 150)">
        <rect width="150" height="104" rx="8" fill="#1b2a3a" stroke="#9aa0b4" strokeWidth="5" />
        <rect x="10" y="10" width="130" height="84" fill="#10151f" />
        {[0, 1, 2, 3].map((i) => {
          const h = 12 + i * 14 + 6 * Math.sin(frame / 6 + i);
          return <rect key={i} x={20 + i * 30} y={88 - h} width="20" height={h} fill="#30c48d" />;
        })}
        <rect x="55" y="104" width="40" height="22" fill="#9aa0b4" />
      </g>
      <g transform={`translate(0 ${bob})`}>
        <Person shirt="#2f7cf6" talk />
        <g transform={`translate(${100 + shakeHands} 196)`}>
          <rect x="-20" y="-15" width="60" height="32" rx="15" fill="#f6cfa8" stroke="#1a1a1a" strokeWidth="4" />
        </g>
      </g>
      {/* cliente entrando */}
      <g transform={`translate(${clientX} 250) scale(0.5)`}>
        <Person shirt="#30c48d" hair="#6b3f1d" />
        <g transform={`translate(${-80 + shakeHands} -40)`}>
          <rect x="-50" y="-15" width="60" height="32" rx="15" fill="#d9a77f" stroke="#1a1a1a" strokeWidth="6" />
        </g>
      </g>
      {/* notificação de lead */}
      <g transform={`translate(-120 ${-70}) scale(${lead})`}>
        <rect x="-70" y="-26" width="140" height="52" rx="26" fill="#ffd400" />
        <text x="0" y="10" textAnchor="middle" fontSize="28" fontWeight="900" fill="#000">+1 lead</text>
      </g>
    </svg>
  );
};

/* ---------- Cenas ---------- */

const Hook: React.FC = () => {
  const a = useIn(0);
  const t = useIn(18);
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Safe center={false}>
        <div style={{ display: "flex", gap: 24, height: 800, opacity: a, transform: `translateY(${(1 - a) * 60}px)` }}>
          {[
            { label: "LADO A", color: C.red, el: <SideA /> },
            { label: "LADO B", color: C.green, el: <SideB /> },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: C.card,
                borderRadius: 32,
                border: `6px solid ${s.color}`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div style={{ color: s.color, fontSize: 52, fontWeight: 900, textAlign: "center", padding: "20px 0" }}>
                {s.label}
              </div>
              <div style={{ flex: 1 }}>{s.el}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 40,
            color: C.text,
            fontSize: 70,
            fontWeight: 900,
            lineHeight: 1.12,
            textAlign: "center",
            opacity: t,
            transform: `scale(${0.9 + 0.1 * t})`,
          }}
        >
          Usar <span style={{ color: C.accent }}>tráfego pago</span> do jeito certo faz os clientes{" "}
          <span style={{ color: C.green }}>virem até você</span>
        </div>
      </Safe>
    </AbsoluteFill>
  );
};

const Problem: React.FC = () => {
  const a = useIn(0);
  const b = useIn(45);
  const c = useIn(100);
  return (
    <AbsoluteFill>
      <Safe>
        <div style={{ color: C.accent, fontSize: 48, fontWeight: 700, letterSpacing: 6, opacity: a }}>
          PROCESSO DE CAPTAÇÃO
        </div>
        <div style={{ color: C.text, fontSize: 88, fontWeight: 900, lineHeight: 1.1, marginTop: 24, opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>
          Quem vende consórcio precisa de um processo próprio de captação de leads
        </div>
        <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 24 }}>
          {["Depender de indicação", "Depender de lista fria"].map((x, i) => {
            const p = i === 0 ? b : c;
            return (
              <div
                key={x}
                style={{
                  background: C.card,
                  borderLeft: `10px solid ${C.red}`,
                  borderRadius: 16,
                  padding: "26px 32px",
                  color: C.text,
                  fontSize: 56,
                  fontWeight: 800,
                  opacity: p,
                  transform: `translateX(${(1 - p) * -80}px)`,
                }}
              >
                ✕ {x}
              </div>
            );
          })}
          <div style={{ color: C.muted, fontSize: 52, fontWeight: 700, opacity: c }}>
            = mais trabalho do que resultado
          </div>
        </div>
      </Safe>
    </AbsoluteFill>
  );
};

const STEPS = [
  { n: 1, t: "Criamos o anúncio", d: "Atrai quem quer consórcio" },
  { n: 2, t: "Formulário de qualificação", d: "Entende o momento do lead" },
  { n: 3, t: "Abordagem assertiva", d: "Ganha a confiança logo no início" },
  { n: 4, t: "Fechamento", d: "Reunião ou presencial no escritório" },
];

const Process: React.FC = () => {
  const head = useIn(0);
  return (
    <AbsoluteFill>
      <Safe>
        <div style={{ color: C.accent, fontSize: 48, fontWeight: 700, letterSpacing: 6, opacity: head }}>
          O QUE FAZEMOS
        </div>
        <div style={{ color: C.text, fontSize: 78, fontWeight: 900, lineHeight: 1.1, margin: "16px 0 40px", opacity: head }}>
          Do anúncio ao fechamento
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {STEPS.map((s, i) => {
            const p = useIn(30 + i * 80);
            return (
              <div
                key={s.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  background: C.card,
                  borderRadius: 24,
                  padding: "26px 30px",
                  opacity: p,
                  transform: `translateX(${(1 - p) * 120}px)`,
                }}
              >
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    background: C.accent,
                    color: "#000",
                    fontSize: 52,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <div style={{ color: C.text, fontSize: 52, fontWeight: 900 }}>{s.t}</div>
                  <div style={{ color: C.muted, fontSize: 38, fontWeight: 600, marginTop: 4 }}>{s.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Safe>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useIn(0);
  const price = useIn(25);
  const btn = useIn(55);
  const pulse = 1 + 0.04 * Math.sin(frame / 5);
  return (
    <AbsoluteFill>
      <Safe>
        <div style={{ color: C.text, fontSize: 84, fontWeight: 900, lineHeight: 1.1, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>
          Copie essa estrutura em apenas <span style={{ color: C.accent }}>5 passos</span>
        </div>
        <div
          style={{
            margin: "56px auto 0",
            background: C.accent,
            color: "#000",
            borderRadius: 36,
            padding: "24px 70px",
            fontSize: 150,
            fontWeight: 900,
            transform: `scale(${price})`,
          }}
        >
          R$ 17,90
        </div>
        <div
          style={{
            margin: "56px auto 0",
            background: C.green,
            color: "#000",
            borderRadius: 999,
            padding: "28px 64px",
            fontSize: 62,
            fontWeight: 900,
            opacity: btn,
            transform: `scale(${btn * pulse})`,
          }}
        >
          Clique em “Saiba mais”
        </div>
      </Safe>
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const frame = useCurrentFrame();
  const inn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const out = interpolate(frame, [frames - 8, frames], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: Math.min(inn, out), transform: `translateY(${(1 - inn) * 30}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {[
        { x: 150, y: 250, c: C.accent, s: 420, k: 0 },
        { x: 900, y: 900, c: C.green, s: 520, k: 2 },
        { x: 200, y: 1600, c: C.red, s: 460, k: 4 },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x + Math.sin(frame / 40 + b.k) * 70 - b.s / 2,
            top: b.y + Math.cos(frame / 50 + b.k) * 70 - b.s / 2,
            width: b.s,
            height: b.s,
            borderRadius: "50%",
            background: b.c,
            opacity: 0.12,
            filter: "blur(90px)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const MAP = { hook: Hook, problem: Problem, process: Process, cta: Cta };

export const ReelAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <Background />
    <Series>
      {SCENES.map((s) => {
        const Comp = MAP[s.id];
        const frames = Math.round(s.seconds * FPS);
        return (
          <Series.Sequence key={s.id} durationInFrames={frames}>
            <Scene frames={frames}>
              <Comp />
            </Scene>
          </Series.Sequence>
        );
      })}
    </Series>
  </AbsoluteFill>
);
