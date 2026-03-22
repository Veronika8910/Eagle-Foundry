#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUT_DIR="$SCRIPT_DIR/dist"
ZIP_FILE="$SCRIPT_DIR/lambda.zip"

cd "$BACKEND_ROOT"

# Bundle the Lambda handler (esbuild is a backend devDependency)
mkdir -p "$OUT_DIR"
npx esbuild "$SCRIPT_DIR/handler.ts" \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=cjs \
  --outfile="$OUT_DIR/handler.js"

# Create deployment package
cd "$OUT_DIR"
zip -q -r "$ZIP_FILE" handler.js
cd - >/dev/null

echo "Built: $ZIP_FILE"
