#!/usr/bin/env bash
# Lista los grupos del usuario (para llenar group_ids en config.json).
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
TOKEN="${FB_APP_TOKEN:-}"
[ -z "$TOKEN" ] && [ -f "$DIR/.fb_token" ] && TOKEN="$(cat "$DIR/.fb_token")"
[ -n "$TOKEN" ] || { echo "ERROR: no hay token"; exit 2; }
curl -s --max-time 25 "https://graph.facebook.com/v20.0/me/groups?fields=id,name,member_count,administrator&limit=200&access_token=${TOKEN}"