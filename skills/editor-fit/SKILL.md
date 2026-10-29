---
name: editor-fit
description: Editor Fit com IA. Edita vídeos de nutricionistas e personal trainers com Remotion (9:16 e 16:9) e orienta a gravação. Calorias de comparação, divisão A/B das falas, infográficos, simulações de exercício, legendas automáticas, cortes e zoom, roteiro de gravação e sugestões de melhoria. Use quando o aluno disser editor fit, editar vídeo fit, ilustrar calorias, comparar alimentos, simular exercício, painel de pace, roteiro de reel fit, anúncio de nutri ou personal.
---

# Editor Fit com IA

## O que o Editor Fit faz
1. **Calorias de comparação:** fornece os dados de calorias de cada alimento para comparar (`references/tabela-calorias.md`).
2. **Divisão A/B das falas:** tela dividida por linha pontilhada, lado A vs lado B (engorda vs emagrece, pace vs velocidade, ovo vs manteiga), cada lado aparece no timestamp da fala.
3. **Infográficos e simulações de exercício:** painéis animados de calorias, macros, pace/velocidade, carga e volume, e simulação do exercício (`references/treino-formulas.md`).
4. **Edição automática:** legendas palavra a palavra com ênfase, cortes de silêncio, zoom, SFX (whoosh, pop, boom) e CTA final.
5. **Orientação de gravação e melhoria:** o aluno diz a ideia; o Claude entrega roteiro e instruções de gravação ANTES, edita DEPOIS e sugere melhorias (`references/guia-gravacao.md`).

## Fluxo
1. **Ideia:** perguntar tema, público e objetivo do vídeo. Entregar o roteiro e as instruções de gravação (`guia-gravacao.md`).
2. **Bruto:** aluno grava e envia. Transcrever com timestamps por palavra (JSON).
3. **Regras:** ler `references/regras-fit.md` antes de qualquer painel com número.
4. **Montar:** A/B, infográficos, simulações, legendas, cortes, zoom, SFX, CTA no `template/`.
5. **Renderizar** sempre versão nova (v1, v2...). Nunca sobrescrever.
6. **Entregar** com: o que foi ilustrado, números que são estimativa e 3 sugestões de melhoria (hook, ritmo, CTA, formato).

## Regra de ouro
Todo painel com número leva o selo "Exemplo ilustrativo · valores aproximados".

## Chaves opcionais
Se faltar `GEMINI_API_KEY` em `.env.local`, edite normalmente SEM narração/imagens geradas. Explique o que a chave libera e aponte `curso/00-configurar-chaves.md`. Nunca peça para o aluno colar a chave no chat.
