#!/usr/bin/env bash
# Publica un mensaje en un grupo de Facebook via Graph API (POST /{group-id}/feed).
# Uso: post.sh <group_id> '<mensaje>'
set -u
GROUP="${1:?group_id}"
MSG="${2:?message}"
DIR="$(cd "$(dirname "$0")" && pwd)"
TOKEN="${FB_APP_TOKEN:-}"
[ -z "$TOKEN" ] && [ -f "$DIR/.fb_token" ] && TOKEN="$(cat "$DIR/.fb_token")"
[ -n "$TOKEN" ] || { echo "ERROR: no hay token (exportar FB_APP_TOKEN o crear .fb_token)"; exit 2; }
RESP="$(curl -s --max-time 25 -X POST "https://graph.facebook.com/v20.0/${GROUP}/feed" \
  --data-urlencode "message=${MSG}" \
  -d "access_token=${TOKEN}")"
echo "$RESP"
if echo "$RESP" | grep -q '"id"'; then echo "RESULT=OK"; exit 0; else echo "RESULT=FAIL"; exit 1; fi