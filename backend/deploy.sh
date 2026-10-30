#!/usr/bin/env bash
# One-command Wasmer deploy for the Parimatch backend.
#
#   bash backend/deploy.sh                       # browser login + deploy
#   WASMER_TOKEN=xxx bash backend/deploy.sh      # token se deploy (CI style)
#   bash backend/deploy.sh --check               # local preflight only (no network)
#
# Token yahan se banao: https://wasmer.io/settings/access-tokens
#
set -uo pipefail

cd "$(dirname "$0")" || exit 1

APP_NAME="$(grep -m1 '^name:' app.yaml | awk '{print $2}')"
APP_NAME="${APP_NAME:-parimatch-backend}"
MODE="${1:-deploy}"

green() { printf '\033[32m%s\033[0m\n' "$1"; }
red()   { printf '\033[31m%s\033[0m\n' "$1"; }
info()  { printf '\033[36m%s\033[0m\n' "$1"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$1"; }

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

# Which code is actually being packaged? A stale checkout silently redeploys old PHP.
if git -C .. rev-parse --git-dir >/dev/null 2>&1; then
  COMMIT="$(git -C .. rev-parse --short HEAD 2>/dev/null)"
  BRANCH="$(git -C .. rev-parse --abbrev-ref HEAD 2>/dev/null)"
  green "  repo: ${BRANCH} @ ${COMMIT}"
  BEHIND="$(git -C .. rev-list --count 'HEAD..@{u}' 2>/dev/null || echo 0)"
  if [ "${BEHIND:-0}" -gt 0 ] 2>/dev/null; then
    yellow "  ⚠ local checkout origin/${BRANCH} se ${BEHIND} commit peeche hai"
    yellow "    deploy se pehle: git -C .. pull"
    info "    (ya ignore karo: --allow-stale)"
    case " $* " in *" --allow-stale "*) : ;; *) exit 1 ;; esac
  fi
fi

[ "$MODE" = "--check" ] && exit 0

# Portable log file: Termux/Android me /tmp nahi hota.
LOG=""
for candidate in "${TMPDIR:-}" /tmp "$PWD"; do
  [ -n "$candidate" ] || continue
  if [ -d "$candidate" ] && [ -w "$candidate" ]; then
    LOG="$candidate/wasmer-deploy.log"
    if : > "$LOG" 2>/dev/null; then break; fi
    LOG=""
  fi
done
[ -n "$LOG" ] || { red "No writable directory for the deploy log"; exit 1; }
info "  deploy log: $LOG"

info "2/4  Wasmer CLI"

# Termux (Android) me Wasmer CLI nahi chalta: wasmer glibc binary hai,
# Android bionic libc use karta hai -> "cannot execute: required file not found".
IN_TERMUX=0
if [ -n "${PREFIX:-}" ] && printf '%s' "$PREFIX" | grep -q 'com.termux'; then
  IN_TERMUX=1
fi

if ! command -v wasmer >/dev/null 2>&1; then
  if [ "$IN_TERMUX" -eq 1 ]; then
    red "  ✗ Termux detected — Wasmer CLI yahan install nahi hoga."
    info "    Termux ke andar chalao:"
    info "      proot-distro install debian"
    info "      proot-distro login debian"
    info "    phir Debian ke andar ye script dobara chalao."
    exit 1
  fi
  info "  installing (curl https://get.wasmer.io -sSfL | sh)"
  curl https://get.wasmer.io -sSfL | sh || { red "  CLI install failed"; exit 1; }
  export PATH="$HOME/.wasmer/bin:$PATH"
fi

# Binary present hona kaafi nahi — actually run hona chahiye.
if ! wasmer --version >/dev/null 2>&1; then
  red "  ✗ wasmer mila par chal nahi raha: $(command -v wasmer)"
  if [ "$IN_TERMUX" -eq 1 ]; then
    red "    Wajah: Termux/Android (bionic libc) vs Wasmer (glibc) mismatch."
    info "    Fix — Debian ke andar karo:"
    info "      pkg install -y proot-distro && proot-distro install debian"
    info "      proot-distro login debian"
    info "      apt update && apt install -y curl git ca-certificates unzip"
    info "      curl https://get.wasmer.io -sSfL | sh && export PATH=\$HOME/.wasmer/bin:\$PATH"
    info "    Termux wala broken install hata do: rm -rf ~/.wasmer"
  else
    info "    'file $(command -v wasmer)' se arch check karo; ya reinstall: rm -rf ~/.wasmer"
  fi
  exit 1
fi
green "  $(wasmer --version 2>/dev/null | head -1)"

info "3/4  Auth"

# Auth probe: not every CLI build has `whoami`, so fall back to `app list`.
auth_ok() {
  wasmer whoami >/dev/null 2>&1 && return 0
  wasmer app list >/dev/null 2>&1 && return 0
  return 1
}

if [ -n "${WASMER_TOKEN:-}" ]; then
  export WASMER_TOKEN
  green "  using WASMER_TOKEN from environment (no browser login)"
elif ! auth_ok; then
  info "  not logged in -> opening browser login"
  info "  (ya: WASMER_TOKEN=xxx bash backend/deploy.sh)"
  wasmer login || { red "  login failed"; exit 1; }
fi

# Best-effort namespace detection (optional, never blocks the deploy).
# `wasmer whoami` on 7.x prints: "Logged into registry wasmer.io as user <name>"
# Older builds print the bare name. Accept only a plain namespace token.
WHOAMI_RAW="$(wasmer whoami 2>/dev/null | tr -d '\r')"
USER_NAME="$(printf '%s\n' "$WHOAMI_RAW" \
  | sed -n 's/.*as user \([A-Za-z0-9._-]*\).*/\1/p' | head -1)"
if [ -z "${USER_NAME:-}" ]; then
  USER_NAME="$(printf '%s' "$WHOAMI_RAW" | tr -d '[:space:]' \
    | grep -E '^[A-Za-z0-9._-]+$' || true)"
fi
if [ -z "${USER_NAME:-}" ]; then
  USER_NAME="$(wasmer app info 2>/dev/null | sed -n 's/.*Owner: *//p' | head -1 | tr -d '\r')"
fi
OWNER="$(grep -m1 '^owner:' app.yaml | awk '{print $2}')"
if [ -n "${USER_NAME:-}" ]; then
  green "  namespace: ${USER_NAME}"
  if [ -n "${OWNER:-}" ] && [ "$OWNER" != "$USER_NAME" ]; then
    red "  ✗ app.yaml owner ($OWNER) != namespace ($USER_NAME)"
    info "    fix: app.yaml me owner hata do, ya '$USER_NAME' kar do"
    exit 1
  fi
else
  info "  namespace detect nahi hua — owner check skip (deploy phir bhi chalega)"
fi

info "4/4  Deploy"
wasmer deploy 2>&1 | tee "$LOG"
status=${PIPESTATUS[0]}

URL="$(grep -oE 'https://[a-z0-9-]+\.wasmer\.app' "$LOG" | tail -1)"
echo
if [ "$status" -ne 0 ]; then
  red "Deployment failed. Log tail:"
  tail -25 "$LOG"
  red "Full log: $LOG  — iska last 25 lines bhej do."
  exit "$status"
fi

if [ -n "${COMMIT:-}" ]; then
  green "Deployed ✓  (${BRANCH} @ ${COMMIT})"
else
  green "Deployed ✓"
fi
if [ -n "${URL:-}" ]; then
  echo "URL: $URL"
  info "Health check:"
  HEALTH="$(curl -s -m 20 "$URL/api/health" || true)"
  printf '%s\n' "$HEALTH" | head -c 600; echo
  echo
  green "Frontend env (Vercel -> Settings -> Environment Variables):"
  echo "  VITE_API_URL=$URL"
  echo "  (dono Vercel projects: Site root=Site, Blog root=Blog -> Redeploy)"
  echo

  case "$HEALTH" in
    *'"db_persistent":false'*)
      yellow "  ⚠  DB /tmp me hai — redeploy pe data wipe ho jayega."
      info "     Fix: app.yaml me volume + DB_PATH=/data/app.db (repo me already hai)"
      info "     ya MySQL secrets:"
      info "       wasmer secret create DB_HOST --value=<host>"
      info "       wasmer secret create DB_NAME --value=<db>"
      info "       wasmer secret create DB_USER --value=<user>"
      info "       wasmer secret create DB_PASS --value=<pass>"
      info "       wasmer secret create APP_KEY  --value=\$(openssl rand -hex 32)"
      ;;
    *'"db_persistent":true'*)
      green "  DB persistent (volume) ✓"
      ;;
  esac
  case "$HEALTH" in
    *'"admin_scope_enabled":false'*)
      info "  admin API band hai — ADMIN_API_TOKEN secret set karke deploy karo (upar dekho)."
      ;;
  esac
else
  info "URL detect nahi hua — deploy output me se manually copy karo."
fi
