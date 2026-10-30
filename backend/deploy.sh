#!/usr/bin/env bash
# One-command Wasmer deploy for the Parimatch backend.
#
#   bash backend/deploy.sh            # full deploy + health check
#   bash backend/deploy.sh --check    # local preflight only (no network)
#
set -uo pipefail

cd "$(dirname "$0")" || exit 1

APP_NAME="$(grep -m1 '^name:' app.yaml | awk '{print $2}')"
APP_NAME="${APP_NAME:-parimatch-backend}"
MODE="${1:-deploy}"

green() { printf '\033[32m%s\033[0m\n' "$1"; }
red()   { printf '\033[31m%s\033[0m\n' "$1"; }
info()  { printf '\033[36m%s\033[0m\n' "$1"; }

fail=0
check() {
  if [ -e "$1" ]; then green "  ✓ $1"; else red "  ✗ $1 missing"; fail=1; fi
}

info "1/4  Preflight (deploy folder MUST be backend/)"
check wasmer.toml
check app.yaml
check app/index.php
check app/helpers.php
check config/config.php
check config/database.php
check config/php.ini
check sql/schema.sql

grep -q 'entrypoint = "run"' wasmer.toml \
  && green "  ✓ wasmer.toml: [package] entrypoint = run" \
  || { red "  ✗ wasmer.toml missing entrypoint (old format)"; fail=1; }

grep -qE '^package:\s*\.\s*$' app.yaml \
  && green "  ✓ app.yaml: package: ." \
  || { red "  ✗ app.yaml must use 'package: .'"; fail=1; }

if grep -q '^\[capabilities' wasmer.toml; then
  red "  ✗ [capabilities] found in wasmer.toml — must live in app.yaml only"; fail=1
fi

if grep -qE '^\s+-S\s+"?0\.0\.0\.0' wasmer.toml 2>/dev/null; then
  info "  ! binding 0.0.0.0 — official examples use localhost:8080"
fi

[ "$fail" -ne 0 ] && { red "Preflight failed — fix the items above."; exit 1; }
green "Preflight OK"

[ "$MODE" = "--check" ] && exit 0

info "2/4  Wasmer CLI"
if ! command -v wasmer >/dev/null 2>&1; then
  info "  installing (curl https://get.wasmer.io -sSfL | sh)"
  curl https://get.wasmer.io -sSfL | sh || { red "  CLI install failed"; exit 1; }
  export PATH="$HOME/.wasmer/bin:$PATH"
fi
green "  wasmer $(wasmer --version 2>/dev/null | head -1)"

info "3/4  Login"
if ! wasmer whoami >/dev/null 2>&1; then
  info "  not logged in -> opening browser login"
  wasmer login || { red "  login failed"; exit 1; }
fi
USER_NAME="$(wasmer whoami 2>/dev/null | head -1)"
green "  logged in as: ${USER_NAME:-unknown}"

OWNER="$(grep -m1 '^owner:' app.yaml | awk '{print $2}')"
if [ -n "${OWNER:-}" ] && [ -n "${USER_NAME:-}" ] && [ "$OWNER" != "$USER_NAME" ]; then
  red "  ✗ app.yaml owner ($OWNER) != logged-in namespace ($USER_NAME)"
  info "    fix: app.yaml me owner hata do, ya '$USER_NAME' kar do"
  exit 1
fi

info "4/4  Deploy"
wasmer deploy 2>&1 | tee /tmp/wasmer-deploy.log
status=${PIPESTATUS[0]}

URL="$(grep -oE 'https://[a-z0-9-]+\.wasmer\.app' /tmp/wasmer-deploy.log | tail -1)"
echo
if [ "$status" -ne 0 ]; then
  red "Deployment failed. Log tail:"
  tail -25 /tmp/wasmer-deploy.log
  red "Full log: /tmp/wasmer-deploy.log  — iska last 25 lines bhej do."
  exit "$status"
fi

green "Deployed ✓"
if [ -n "${URL:-}" ]; then
  echo "URL: $URL"
  info "Health check:"
  curl -s -m 20 "$URL/api/health" | head -c 600; echo
  echo
  green "Frontend env (Vercel -> Site -> Settings -> Environment Variables):"
  echo "  VITE_API_URL=$URL"
else
  info "URL detect nahi hua — deploy output me se manually copy karo."
fi
