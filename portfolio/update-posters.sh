#!/bin/bash
# Run this whenever you add or remove images from assets/posters/
# It regenerates the manifest that the carousel reads.

DIR="$(cd "$(dirname "$0")" && pwd)/assets/posters"
MANIFEST="$DIR/manifest.json"

echo -n "[" > "$MANIFEST"
first=true
for f in "$DIR"/*.{png,jpg,jpeg,webp,svg,gif}; do
  [ -f "$f" ] || continue
  name="$(basename "$f")"
  [ "$name" = "manifest.json" ] && continue
  if [ "$first" = true ]; then
    first=false
  else
    echo -n "," >> "$MANIFEST"
  fi
  echo -n "\"$name\"" >> "$MANIFEST"
done
echo "]" >> "$MANIFEST"

echo "Updated manifest with $(cat "$MANIFEST" | tr ',' '\n' | wc -l | tr -d ' ') images."
