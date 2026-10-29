// Gera a narração (Gemini TTS) de cada passo e grava as durações em src/durations.json.
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";

const root = path.resolve(import.meta.dirname, "..");
for (const f of [path.join(root, "..", ".env.local"), path.join(root, ".env.local")]) {
  if (!fs.existsSync(f)) continue;
  for (const l of fs.readFileSync(f, "utf8").split("\n")) {
    const [k, ...v] = l.split("=");
    if (k && v.length && !k.startsWith("#")) process.env[k.trim()] = v.join("=").trim();
  }
}
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY não encontrada. Veja curso/00-configurar-chaves.md");
  process.exit(1);
}

const VOICE = process.env.VOICE || "Vindemiatrix";
const MODEL = "gemini-2.5-flash-preview-tts";
const only = process.argv[2]; // ex.: aula1
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const lessons = JSON.parse(fs.readFileSync(path.join(root, "roteiros.json"), "utf8"));
const durFile = path.join(root, "src", "durations.json");
const durations = fs.existsSync(durFile) ? JSON.parse(fs.readFileSync(durFile, "utf8")) : {};

for (const L of lessons) {
  if (only && L.id !== only) continue;
  fs.mkdirSync(path.join(root, "public", "audio", L.id), { recursive: true });
  durations[L.id] = [];
  for (let i = 0; i < L.steps.length; i++) {
    const out = path.join(root, "public", "audio", L.id, `s${i}.mp3`);
    if (!fs.existsSync(out)) {
      // plano gratuito do Gemini: ~3 pedidos/min. Espera e tenta de novo se bater o limite.
      let res;
      for (let tentativa = 0; ; tentativa++) {
        try {
          res = await ai.models.generateContent({
            model: MODEL,
            contents: [{ parts: [{ text: `Narre em português do Brasil, em tom calmo, simpático e didático, num ritmo tranquilo: ${L.steps[i].fala}` }] }],
            config: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
          });
          break;
        } catch (e) {
          if (tentativa >= 6 || !String(e).includes("429")) throw e;
          console.log("limite do plano gratuito, aguardando 30s...");
          await new Promise((r) => setTimeout(r, 30000));
        }
      }
      await new Promise((r) => setTimeout(r, 21000));
      const part = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part) throw new Error(`Sem áudio em ${L.id} passo ${i}`);
      const pcm = out + ".pcm";
      fs.writeFileSync(pcm, Buffer.from(part.inlineData.data, "base64"));
      execSync(`ffmpeg -y -loglevel error -f s16le -ar 24000 -ac 1 -i "${pcm}" -ar 44100 -ab 128k "${out}"`);
      fs.unlinkSync(pcm);
    }
    const d = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${out}"`).toString());
    durations[L.id].push(Math.round(d * 100) / 100);
    console.log(`${L.id} passo ${i + 1}/${L.steps.length}: ${d.toFixed(1)}s`);
  }
}
fs.writeFileSync(durFile, JSON.stringify(durations, null, 1));
