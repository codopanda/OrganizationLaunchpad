#!/usr/bin/env bash

set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: ./scripts/new-app.sh <app-name>"
  exit 1
fi

APP_NAME="$1"
APP_DIR="apps/$APP_NAME"
TEMPLATE_DIR="templates/vanilla-auth-app"
APP_TITLE="$(printf '%s' "$APP_NAME" | sed 's/-/ /g')"

if [ -e "$APP_DIR" ]; then
  echo "Error: $APP_DIR already exists"
  exit 1
fi

cp -R "$TEMPLATE_DIR" "$APP_DIR"
find "$APP_DIR" -name '.DS_Store' -delete

find "$APP_DIR" -type f \( -name '*.json' -o -name '*.ts' -o -name '*.md' -o -name '*.html' \) \
  -exec sed -i '' "s/__APP_NAME__/$APP_NAME/g" {} \;

find "$APP_DIR" -type f \( -name '*.json' -o -name '*.ts' -o -name '*.md' -o -name '*.html' \) \
  -exec sed -i '' "s/__APP_TITLE__/$APP_TITLE/g" {} \;

echo "Created $APP_DIR from templates/vanilla-auth-app"
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run dev -w $APP_NAME"
