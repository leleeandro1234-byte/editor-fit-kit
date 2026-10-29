#!/bin/bash
# Gera o .zip para distribuir: só arquivos versionados (nunca .env.local, node_modules ou vídeos).
set -e
git archive --format=zip --prefix=editor-fit-kit/ -o "$HOME/Downloads/editor-fit-kit.zip" HEAD
echo "Gerado: $HOME/Downloads/editor-fit-kit.zip"
