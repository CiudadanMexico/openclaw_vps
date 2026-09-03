#!/usr/bin/env bash
set -uo pipefail
export HOME=/home/ayisus
export PATH=/home/ayisus/.openclaw/tools/node-v24.15.0/bin:/home/ayisus/.openclaw/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
OC=/home/ayisus/.openclaw/bin/openclaw
KEEP=50
LOG=/home/ayisus/.openclaw/session-guard.log
: >> "$LOG"
printf '%s RUN\n' "$(date -Is)" >> "$LOG"
while IFS=$'\t' read -r key file; do
  [ -z "$key" ] && continue
  printf '%s TRUNCATE %s\n' "$(date -Is)" "$key" >> "$LOG"
  "$OC" sessions compact "$key" --max-lines "$KEEP" >/dev/null 2>>"$LOG"
done < <(node -e 'const fs=require("fs");const base="/home/ayisus/.openclaw/agents";let out="";try{for(const a of fs.readdirSync(base)){const p=base+"/"+a+"/sessions/sessions.json";if(!fs.existsSync(p))continue;let obj;try{obj=JSON.parse(fs.readFileSync(p,"utf8"));}catch(e){continue;}for(const k in obj){if(!k.includes("whatsapp"))continue;const f=(obj[k].sessionFile||"");if(!f||!fs.existsSync(f))continue;let lines=0,bytes=0;try{const st=fs.statSync(f);bytes=st.size;}catch(e){}try{const t=fs.readFileSync(f,"utf8");lines=(t.split("\n").length-1);}catch(e){continue;}if(lines>120||bytes>150000){out+=k+"\t"+f+"\n";}}}}catch(e){}process.stdout.write(out);')
exit 0