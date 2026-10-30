#!/usr/bin/env bash
# One-command health + CRUD smoke test for the deployed backend.
#
#   bash backend/smoke.sh                                  # live URL
#   bash backend/smoke.sh http://localhost:8080            # local
#   bash backend/smoke.sh https://... --keep               # don't delete the test record
#
# Exit code 0 = all checks passed.
set -uo pipefail

BASE="${1:-https://parimatch-backend.wasmer.app}"
BASE="${BASE%/}"
KEEP=0
for arg in "$@"; do [ "$arg" = "--keep" ] && KEEP=1; done

CID="smoke-$(date +%s)-$$"
pass=0
fail=0
ok()   { printf '\033[32m  ✓ %s\033[0m\n' "$1"; pass=$((pass + 1)); }
bad()  { printf '\033[31m  ✗ %s\033[0m\n' "$1"; fail=$((fail + 1)); }
note() { printf '\033[36m    %s\033[0m\n' "$1"; }
info() { printf '\033[36m%s\033[0m\n' "$1"; }

# Compact a JSON body so pattern matching works regardless of spacing.
compact() { tr -d ' \t\r\n'; }

json() { # json <key>  (first match, string or bare token)
  sed -n "s/.*\"$1\":\"\([^\"]*\)\".*/\1/p" | head -1
}

echo "Base: $BASE"
echo "Client-Id: $CID"
echo

info "1/5  Health"
health_raw="$(curl -s -m 20 "$BASE/api/health" || true)"
health="$(printf '%s' "$health_raw" | compact)"
if [ -z "$health" ]; then
  bad "no response from $BASE/api/health"
  note "URL galat hai, ya app abhi start ho raha hai — 20s baad dobara try karo."
  exit 1
fi
case "$health" in *'"ok":true'*) ok "API reachable" ;; *) bad "unexpected health body" ;; esac
case "$health" in *'"db":"connected"'*) ok "db connected" ;; *) bad "db NOT connected" ;; esac

version="$(printf '%s' "$health" | json version)"
driver="$(printf '%s' "$health" | json db_driver)"
dbpath="$(printf '%s' "$health" | json db_path)"
persist="$(printf '%s' "$health" | grep -o '"db_persistent":[a-z]*' | cut -d: -f2)"
note "version=${version:-?} driver=${driver:-?} db_path=${dbpath:-?} persistent=${persist:-?}"
case "$persist" in
  true)  ok "data persistent (volume)" ;;
  false) bad "DB /tmp me hai — redeploy pe data jayega" ;;
  *)     note "db_persistent field nahi hai (purana build?)" ;;
esac
case "$health" in
  *'"admin_scope_enabled":true'*)  ok "admin API enabled" ;;
  *'"admin_scope_enabled":false'*) note "admin API band (ADMIN_API_TOKEN secret nahi hai)" ;;
esac
echo

info "2/5  Create complaint"
created="$(curl -s -m 20 -X POST "$BASE/api/complains" \
  -H 'Content-Type: application/json' \
  -H "X-Client-Id: $CID" \
  -d "{\"type\":\"deposit\",\"details\":{\"userName\":\"Smoke Test\",\"mobile\":\"9876543210\",\"email\":\"smoke@example.com\",\"depositAmount\":\"100\",\"message\":\"smoke $CID\"}}" || true)"
created_c="$(printf '%s' "$created" | compact)"
id="$(printf '%s' "$created_c" | json id)"
case "$created_c" in *'"ok":true'*) : ;; *) bad "create ne ok:true nahi diya" ;; esac
if [ -n "$id" ]; then ok "created id=$id"; else bad "create failed: ${created:0:160}"; fi
echo

info "3/5  List complaints"
if [ -z "$id" ]; then
  bad "record bana hi nahi — list/fetch/cleanup skip"
else
  list="$(curl -s -m 20 "$BASE/api/complains?limit=10" -H "X-Client-Id: $CID" | compact || true)"
  case "$list" in
    *"$id"*) ok "created record list me hai" ;;
    *)       bad "list me record nahi mila: ${list:0:160}" ;;
  esac
fi
echo

info "4/5  Fetch by id"
if [ -n "$id" ]; then
  one="$(curl -s -m 20 "$BASE/api/complains/$id" -H "X-Client-Id: $CID" | compact || true)"
  case "$one" in
    *"$id"*) ok "GET /api/complains/$id ok" ;;
    *)       bad "GET by id failed: ${one:0:160}" ;;
  esac
fi
echo

info "5/5  Cleanup"
if [ "$KEEP" -eq 1 ]; then
  note "--keep diya hai, record chhoda: $id"
elif [ -n "$id" ]; then
  del="$(curl -s -m 20 -X DELETE "$BASE/api/complains/$id" -H "X-Client-Id: $CID" | compact || true)"
  case "$del" in
    *'"ok":true'*) ok "test record delete ho gaya" ;;
    *)             bad "delete failed: ${del:0:160}" ;;
  esac
fi
echo

if [ "$fail" -eq 0 ]; then
  printf '\033[32mAll %d checks passed.\033[0m\n' "$pass"
  exit 0
fi
printf '\033[31m%d passed, %d FAILED.\033[0m\n' "$pass" "$fail"
exit 1
