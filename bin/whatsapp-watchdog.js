#!/usr/bin/env node
const fs=require('fs');
const {execFileSync}=require('child_process');
const HOME='/home/ayisus';
const OC=HOME+'/.openclaw/bin/openclaw';
const LEDGER=HOME+'/.openclaw/whatsapp-ledger';
const STATE=HOME+'/.openclaw/whatsapp-watchdog.state';
const LOG=HOME+'/.openclaw/whatsapp-watchdog.log';
const WINDOW=40*60, GRACE=5*60, COOLDOWN=30*60*1000, MAXLINES=500;
const log=m=>{try{fs.appendFileSync(LOG,new Date().toISOString()+' '+m+'\n');}catch(e){}};
try{fs.appendFileSync(LOG,'');}catch(e){}
const pad=n=>String(n).padStart(2,'0');
function localSince(s){const d=new Date(Date.now()-s*1000);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());}
function e164(s){let d=(s||'').replace(/\D/g,'');if(!d)return null;if(!d.startsWith('52'))d='52'+d;return '+'+d;}
const seen=new Set();
try{ if(fs.existsSync(LEDGER)){ for(const l of fs.readFileSync(LEDGER,'utf8').split('\n')){ const m=l.match(/^\s*(\S+)\s+(recv|sent)\s+(\S+)/); if(m){ const ms=Date.parse(m[1]); if(ms) seen.add(m[2]+':'+ms+':'+m[3]); } } } }catch(e){}
const events=[];
try{
  const out=execFileSync('journalctl',['--user','-u','openclaw-gateway','--no-pager','-o','json','--since',localSince(WINDOW)],{encoding:'utf8',maxBuffer:64*1024*1024});
  for(const line of out.split('\n')){
    if(!line) continue;
    let e; try{ e=JSON.parse(line); }catch(_){ continue; }
    const m=e.MESSAGE||''; if(m.indexOf('[whatsapp]')<0) continue;
    const t=e.__REALTIME_TIMESTAMP?Math.floor(+e.__REALTIME_TIMESTAMP/1000):0; if(!t) continue;
    const im=m.match(/Inbound message (\S+) ->/);
    if(im){ const s=e164(im[1]); if(s){ const k='recv:'+t+':'+s; if(!seen.has(k)){ seen.add(k); events.push({type:'recv',sender:s,ms:t}); } } continue; }
    if(/Sent message/.test(m)){ const k='sent:'+t+':-'; if(!seen.has(k)){ seen.add(k); events.push({type:'sent',sender:'-',ms:t}); } }
  }
}catch(e){ log('journal error: '+e.message); }
if(events.length){
  const lines=events.sort((a,b)=>a.ms-b.ms).map(e=>new Date(e.ms).toISOString()+' '+e.type+' '+e.sender);
  if(fs.existsSync(LEDGER)) fs.appendFileSync(LEDGER,lines.join('\n')+'\n'); else fs.writeFileSync(LEDGER,lines.join('\n')+'\n');
  let arr=fs.readFileSync(LEDGER,'utf8').split('\n'); while(arr.length>MAXLINES) arr.shift(); fs.writeFileSync(LEDGER,arr.join('\n')+'\n');
  log('appended '+events.length+' journal event(s)');
}
let recv={}, sent=[];
try{ for(const l of fs.readFileSync(LEDGER,'utf8').split('\n')){ const m=l.match(/^\s*(\S+)\s+(recv|sent)\s+(\S+)/); if(!m) continue; const ms=Date.parse(m[1]); if(!ms) continue; if(m[2]==='recv'){ const s=e164(m[3]); if(s&&ms>(recv[s]||0)) recv[s]=ms; } else { sent.push(ms); } } }catch(e){}
const lastSent=sent.length?Math.max.apply(null,sent):0;
const now=Date.now();
let found=null;
for(const s in recv){ if(!e164(s))continue; if(recv[s]>lastSent){ const age=(now-recv[s])/1000; if(age>GRACE&&age<WINDOW+120){ found={s,age:Math.round(age)}; break; } } }
let st={}; try{ st=JSON.parse(fs.readFileSync(STATE,'utf8')); }catch(e){st={};}
log('recv='+Object.keys(recv).map(k=>k).join(',')||'-'+' lastSent='+(lastSent?new Date(lastSent).toISOString().slice(11,19):'never')+' found='+(found?found.s+':'+found.age+'s':'no'));
if(found){
  const s=found.s; const lastNotify=st[s]||0;
  if((now-lastNotify)>COOLDOWN){
    const msg='Disculpa, tu ultimo mensaje quedo sin respuesta por un fallo interno. Ya corregí el servicio; vuelve a escribirme y te respondo.';
    try{ const r=execFileSync(OC,['message','send','--channel','whatsapp','--target',s,'--message',msg],{encoding:'utf8'});
      log('NOTIFY sent to '+s+' :: '+String(r).slice(0,200).replace(/\s+/g,' '));
      st[s]=now; fs.writeFileSync(STATE,JSON.stringify(st));
    }catch(e){ log('NOTIFY FAIL '+s+' :: '+String(e.message).slice(0,200)); }
  } else { log('cooldown active '+s); }
}