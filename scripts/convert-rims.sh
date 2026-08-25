#!/usr/bin/env bash
# Convert a CC0 rim source file to a centered, unit-scaled GLB in
# `public/models/catalog/`. Intended for adding new entries to the
# catalog — see `public/models/catalog/SOURCES.md` for download URLs.
#
# Usage:
#   scripts/convert-rims.sh <input.{fbx,obj,blend}> <slug>
#
# Requires: `blender` in PATH (tested with 4.x; 3.6+ also works).
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <input.fbx|obj|blend> <slug>" >&2
  exit 64
fi

INPUT="$1"
SLUG="$2"
OUT="public/models/catalog/${SLUG}.glb"

if [[ ! -f "$INPUT" ]]; then
  echo "error: input not found: $INPUT" >&2
  exit 66
fi

if ! command -v blender >/dev/null 2>&1; then
  echo "error: 'blender' not in PATH. Install: sudo apt install blender" >&2
  exit 69
fi

mkdir -p "$(dirname "$OUT")"

# The Blender export script lives next to this shell wrapper so the
# path stays stable regardless of cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

blender -b "$INPUT" \
  -P "${SCRIPT_DIR}/blender-export-glb.py" \
  -- "$OUT"

echo "wrote $OUT"
