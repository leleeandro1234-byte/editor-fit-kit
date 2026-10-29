#!/bin/bash
set -e
DEST="$HOME/.claude/skills"
mkdir -p "$DEST"
for s in skills/*/; do
  name=$(basename "$s")
  cp -R "$s" "$DEST/$name"
  echo "Instalada: $name"
done
echo "Pronto. Abra o Claude Code e diga: editor fit"
