# Template Remotion — Editor Fit

Projeto base: vídeo 9:16 com legendas palavra a palavra, ênfase, zoom e CTA.

## Rodar
1. `cd template && npm install`
2. Coloque seu vídeo em `public/meu-video.mp4`
3. Edite `src/config.ts` (duração, palavras em destaque, CTA, @perfil)
4. Substitua `src/transcript.json` pela transcrição do seu vídeo (palavra a palavra, formato igual ao exemplo)
5. Prévia: `npx remotion studio src/index.ts`
6. Renderizar: `npx remotion render src/index.ts Starter out/meu-video-v1.mp4`

## Com o Claude Code
Diga: `editor fit, edite public/meu-video.mp4`. Ele transcreve, ajusta o config e monta A/B, infográficos e simulações.

## Pasta `referencia/`
`AdEdit.tsx` (A/B, painéis de calorias, pace e SFX) e `EditorFitV.tsx` (mini-VSL com split e infográficos) são exemplos completos. Copie trechos para o `Starter.tsx`.
