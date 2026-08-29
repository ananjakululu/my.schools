#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  ElimuTrack — one-shot Fly.io deploy
#  Run this on YOUR machine (your flyctl is already logged in via
#  GitHub). It provisions Postgres, sets secrets and deploys the
#  CURRENT folder.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

APP_NAME="${APP_NAME:-elimutrack}"
REGION="${REGION:-nbo}"

echo "▶ Step 1/4 — login check"
fly auth whoami >/dev/null 2>&1 || { echo "❌ Not logged in. Run: fly auth login"; exit 1; }

echo "▶ Step 2/4 — PostgreSQL"
if fly postgres list 2>/dev/null | grep -q "elimutrack-db"; then
  echo "   using existing cluster elimutrack-db"
else
  echo "   creating cluster elimutrack-db (billed resource)"
  fly postgres create --name elimutrack-db --region "$REGION" --org personal
fi

echo "▶ Step 3/4 — app + attach + secrets"
if ! fly apps list 2>/dev/null | grep -q "$APP_NAME"; then
  fly apps create "$APP_NAME" --org personal
fi
fly postgres attach elimutrack-db --app "$APP_NAME" || true
fly secrets set --app "$APP_NAME" JWT_SECRET="$(openssl rand -hex 32)" NODE_ENV=production

echo "▶ Step 4/4 — deploy (from the CURRENT folder)"
fly deploy --app "$APP_NAME" --region "$REGION"

echo ""
echo "✅ Done — your app:"
fly apps open --app "$APP_NAME"
curl -s "https://$APP_NAME.fly.dev/api/health" && echo ""
