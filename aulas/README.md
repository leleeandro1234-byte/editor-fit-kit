# Aulas em vídeo (Remotion + Gemini TTS)

Aulas curtas, passo a passo, em 16:9 com narração.

| Aula | Tema |
|---|---|
| 1 | Instalar o Claude Code |
| 2 | Instalar o Kit Editor Fit |
| 3 | Configurar a chave do Gemini (opcional) |
| 4 | Seu primeiro vídeo editado |

## Regerar os vídeos
1. `cd aulas && npm install`
2. Chave do Gemini em `../.env.local` (veja `../curso/00-configurar-chaves.md`)
3. Edite `roteiros.json` (texto, comandos, listas de cada passo)
4. `npm run narrar` gera as vozes (plano gratuito: 10 pedidos por dia, o script espera sozinho e reaproveita áudios prontos)
5. `npm run render` grava os vídeos em `out/` (a pasta não vai para o GitHub)
