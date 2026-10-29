# Configurar chaves (opcional)

Sem chave você já edita vídeos (legenda, zoom, A/B, calorias, pace). A chave libera narração por IA e imagens geradas.

## Gemini (Google AI Studio) — grátis para começar
1. Acesse aistudio.google.com/apikey e entre com sua conta Google
2. Clique em **Create API key** e copie o código
3. Na pasta do kit, copie o arquivo de exemplo: `cp .env.example .env.local`
4. Abra o `.env.local` e cole a chave depois de `GEMINI_API_KEY=` (sem espaços nem aspas)
5. Teste: peça ao Claude "gere uma narração de teste"

## Regras de segurança
- O `.env.local` nunca vai para o GitHub (já está no `.gitignore`)
- Nunca cole a chave em chat, e-mail ou print
- Se vazar, apague a chave no site e gere outra
