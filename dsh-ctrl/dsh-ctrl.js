#!/usr/bin/env node
/*
 * dsh-ctrl — control/interroget DeepSeek Harness instances over an SSH tunnel.
 *
 * The VPS reaches DSH through reverse SSH tunnels:
 *   127.0.0.1:13080  ->  DSH instance on port 3080
 *   127.0.0.1:13081  ->  DSH instance on port 3081
 *
 * Wire format (from dsh-host-apiproxy): POST /api/<method> with
 *   { type:'client-request', rpcId, method, payload }
 * Response: { type:'server-response', rpcId, result:{ok,value|error} }
 *
 * No auth is required because the /api fence accepts loopback
 * (the tunnel terminates into DSH's loopback).
 *
 * Usage examples:
 *   dsh-ctrl instances
 *   dsh-ctrl list
 *   dsh-ctrl list --instance 3081
 *   dsh-ctrl list --filter wikis
 *   dsh-ctrl status
 *   dsh-ctrl status --instance 3081 --all
 *   dsh-ctrl status --instance 3080 <sessionId>
 *   dsh-ctrl new --instance 3080 --cwd "C:/some/folder"
 *   dsh-ctrl prompt --instance 3080 <sessionId> "tu mensaje al agente"
 *   dsh-ctrl cancel --instance 3080 <sessionId>
 *   dsh-ctrl history --instance 3080 <sessionId> 25
 *   dsh-ctrl answers
 */
const INSTANCES = {
  '3080': 'http://127.0.0.1:13080',
  '3081': 'http://127.0.0.1:13081',
};
// Cloud-ready: la base por instancia puede sobrescribirse con env
// (DSH_BASE_3080 / DSH_BASE_3081), por ej. https://dsh1.MIDOMINIO en el server nuevo.
function baseFor(i) { return process.env['DSH_BASE_' + i] || INSTANCES[i] || null; }
// Cloudflare Access Service Token (opcional): si están definidos en env, dsh-ctrl
// manda los headers CF-Access-Client-Id / CF-Access-Client-Secret en cada petición.
function accessHeaders() {
  const id = process.env.CF_ACCESS_CLIENT_ID;
  const sec = process.env.CF_ACCESS_CLIENT_SECRET;
  if (id && sec) return { 'CF-Access-Client-Id': id, 'CF-Access-Client-Secret': sec };
  return {};
}

function argVals(argv, name) {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === name) out.push(argv[++i]);
    else if (String(argv[i]).startsWith(name + '=')) out.push(String(argv[i]).slice(name.length + 1));
  }
  return out;
}
function argVal(argv, name, def) { const v = argVals(argv, name); return v.length ? v[v.length - 1] : def; }
function has(argv, name) { return argv.includes(name); }

async function rpc(base, method, payload) {
  const rpcId = 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  const res = await fetch(`${base}/api/${method}`, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, accessHeaders()),
    body: JSON.stringify({ type: 'client-request', rpcId, method, payload }),
  });
  const j = await res.json().catch(() => ({}));
  if (j && j.type === 'server-response') return j.result;
  throw new Error('bad response ' + JSON.stringify(j).slice(0, 300));
}

function blocksToText(content) {
  if (!Array.isArray(content)) return '';
  return content
    .map((c) => (c && c.type === 'text' && typeof c.text === 'string' ? c.text : ''))
    .join('\n').trim();
}

function short(s, n = 160) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 3) + '...' : s; }
function reasonStr(r) { return typeof r === 'string' ? r : (r && typeof r === 'object') ? (r.name || r.code || JSON.stringify(r)) : String(r); }

async function getInstanceSet(argv) {
  const i = argVal(argv, '--instance', '3080');
  const base = baseFor(i);
  if (!base) throw new Error(`instancia desconocida: ${i} (válidas: ${Object.keys(INSTANCES).join(', ')})`);
  return { i, base };
}

async function cmdDescribe() {
  const rows = [];
  for (const i of Object.keys(INSTANCES)) {
    const base = baseFor(i);
    try {
      const r = await rpc(base, 'host.describe', {});
      const v = r.value || {};
      rows.push({ inst: i, ok: true, version: v.version, model: v.model, cwd: v.cwd, home: v.home, attached: v.attachedSessions });
    } catch (e) {
      rows.push({ inst: i, ok: false, error: e.message });
    }
  }
  console.log('dsh-ctrl — instancias DeepSeek Harness (vía túnel SSH)');
  for (const r of rows) {
    if (!r.ok) { console.log(`  [${r.inst}] NO ALCANZABLE: ${r.error}`); continue; }
    console.log(`  [${r.inst}] version=${r.version} modelo=${r.model} cwd=${r.cwd} sesionesAdjuntas=${r.attached}`);
  }
}

async function listItems({ base }) {
  const r = await rpc(base, 'session.list', {});
  return (r.value && r.value.items) || [];
}
async function workspaces({ base }) {
  try { const r = await rpc(base, 'workspace.list', {}); return (r.value && r.value.items) || []; }
  catch { return []; }
}

async function cmdList(argv) {
  const { i, base } = await getInstanceSet(argv);
  const filter = argVal(argv, '--filter', '');
  const items = await listItems({ base });
  const ws = await workspaces({ base });
  const bySess = new Map();
  for (const w of ws) for (const id of w.sessionIds || []) bySess.set(id, w.path);
  console.log(`== DSH [${i}] · sesiones (${items.length}) ==`);
  for (const it of items) {
    const key = String(it.sessionId);
    if (filter && !(String(it.cwd || '').toLowerCase().includes(filter.toLowerCase()) || (bySess.get(key) || '').toLowerCase().includes(filter.toLowerCase()))) continue;
    const title = it.projections && it.projections.values && it.projections.values.title;
    const wsPath = bySess.get(key) || it.cwd || '';
    const state = it.blank ? 'vacia' : (it.running ? 'ACTIVA/pensando' : 'idle');
    const when = it.updatedAt ? new Date(it.updatedAt).toISOString() : '?';
    console.log(`  ${key}  ${state.padEnd(14)} ${short(title, 40).padEnd(40)} cwd=${wsPath} updated=${when}`);
  }
}

// Tail history: gather last seen events + projections (title, goal).
async function statusOne({ base, sessionId }) {
  const hist = await rpc(base, 'session.history', { sessionId, maxMessages: 40 });
  const events = (hist.value && hist.value.events) || [];
  const proj = hist.value && hist.value.projections;
  let lastUser = '', lastAsst = '', lastTurnEnd = null, lastTurnStart = null, lastTodo = null, lastTool = '';
  for (const h of events) {
    const e = h.event;
    if (!e) continue;
    switch (e.type) {
      case 'user/message': { const t = blocksToText(e.data && e.data.content); if (t) lastUser = t; break; }
      case 'assistant/message': { const t = blocksToText(e.data && e.data.message && e.data.message.content); if (t) lastAsst = t; break; }
      case 'turn/start': lastTurnStart = e; lastTurnEnd = null; break;
      case 'turn/end': lastTurnEnd = { reason: e.data && e.data.reason, turn: e.data && e.data.turn }; break;
      case 'todo/write': if (e.data && Array.isArray(e.data.todos)) lastTodo = e.data.todos; break;
      case 'tool/call': lastTool = `${e.data && e.data.name}(${short(e.data && e.data.arguments, 40)})`; break;
      case 'tool/result': if (e.data && e.data.error) lastTool = `ERROR en ${lastTool}`; break;
    }
  }
  const values = (proj && proj.values) || {};
  const goal = values.goal || null;
  return { events, lastUser, lastAsst, lastTurnEnd, lastTurnStart, lastTodo, lastTool, title: values.title, goal };
}

async function cmdStatus(argv) {
  const { i, base } = await getInstanceSet(argv);
  const fwd = argVals(argv, '--session');
  const wantAll = has(argv, '--all');
  const filter = argVal(argv, '--filter', '');
  const items = await listItems({ base });
  let byId = new Map(items.map((s) => [String(s.sessionId), s]));
  if (fwd.length === 0 && !wantAll) {
    // default: the most recently updated non-blank session
    const live = items.filter((s) => !s.blank).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const pick = live.slice(0, 3);
    for (const s of pick) { const c = await statusOne({ base, sessionId: s.sessionId }); console.log(renderStatus(i, s, c)); }
    return;
  }
  const sel = fwd.length ? fwd : items.filter((s) => !s.blank && (!filter || String(s.cwd || '').includes(filter))).map((s) => s.sessionId);
  for (const id of sel) {
    const s = byId.get(String(id));
    const c = await statusOne({ base, sessionId: String(id) });
    console.log(renderStatus(i, s || { sessionId: id }, c));
  }
}

function renderStatus(i, s, c) {
  const st = s.blank ? 'vacia' : (s.running ? 'ACTIVA (pensando)' : 'idle');
  const out = [];
  out.push(`== DSH[${i}] sesión ${s.sessionId} · ${st}`);
  if (c.title) out.push(`  título: ${c.title}`);
  if (s.cwd) out.push(`  cwd: ${s.cwd}`);
  if (s.agentPreset) out.push(`  preset: ${s.agentPreset}`);
  if (c.lastTurnEnd && c.lastTurnEnd.reason) out.push(`  último turno cerró con: ${reasonStr(c.lastTurnEnd.reason)}`);
  const goal = c.goal;
  if (goal) {
    const g = goal.objective || goal;
    const phase = goal.phase || goal.status || (goal.revision !== undefined ? 'activo' : '');
    out.push(`  GOAL pendiente: ${short(typeof g === 'string' ? g : JSON.stringify(g), 200)}`);
    if (phase) out.push(`    fase: ${JSON.stringify(phase)}`);
  } else {
    out.push(`  goal: (ninguno)`);
  }
  if (c.lastUser) out.push(`  último usuario: ${short(c.lastUser)}`);
  if (c.lastAsst) out.push(`  último assistant: ${short(c.lastAsst)}`);
  if (c.lastTool) out.push(`  última herramienta: ${short(c.lastTool)}`);
  if (c.lastTodo && c.lastTodo.length) {
    const pending = c.lastTodo.filter((t) => t && !t.status).map((t) => t.content || t.task || '').filter(Boolean);
    out.push(`  PENDIENTES (${pending.length}): ${pending.slice(0, 6).map((p) => `• ${short(p, 80)}`).join(' ')}`);
  } else if (c.lastTodo) {
    out.push(`  pendientes: 0`);
  }
  return out.join('\n');
}

async function cmdNew(argv) {
  const { i, base } = await getInstanceSet(argv);
  const cwd = argVal(argv, '--cwd');
  const payload = {};
  if (cwd) payload.cwd = cwd;
  const r = await rpc(base, 'session.create', payload);
  console.log(JSON.stringify(r.value || r));
}

async function cmdPrompt(argv) {
  const { i, base } = await getInstanceSet(argv);
  const sid = argVal(argv, '--session');
  const rest = argv.filter((a) => !String(a).startsWith('-')).slice(has(argv, 'prompt') ? 1 : 0);
  if (!sid) throw new Error('falta --session <id>');
  const text = argVals(argv, '--text').concat(rest.filter((x) => x !== 'prompt')).join(' ').trim();
  if (!text) throw new Error('falta texto del mensaje');
  const r = await rpc(base, 'session.prompt', {
    sessionId: sid,
    mode: 'queue',
    content: [{ type: 'text', text }],
  });
  console.log(JSON.stringify(r.value || r));
}

async function cmdCancel(argv) {
  const { base } = await getInstanceSet(argv);
  const sid = argVal(argv, '--session');
  if (!sid) throw new Error('falta --session <id>');
  const r = await rpc(base, 'session.cancel', { sessionId: sid });
  console.log(JSON.stringify(r.value || r));
}

async function cmdHistory(argv) {
  const { i, base } = await getInstanceSet(argv);
  const sid = argVal(argv, '--session');
  if (!sid) throw new Error('falta --session <id>');
  const n = parseInt(argVal(argv, '--n', '25'), 10) || 25;
  const hist = await rpc(base, 'session.history', { sessionId: sid, maxMessages: n });
  const events = (hist.value && hist.value.events) || [];
  console.log(`== DSH[${i}] ${sid} · últimos ${events.length} eventos ==`);
  for (const h of events) {
    const e = h.event; if (!e) continue;
    const when = e.time ? new Date(e.time).toISOString().slice(11, 19) : '--';
    switch (e.type) {
      case 'user/message': console.log(`${when} [user] ${short(blocksToText(e.data.content), 200)}`); break;
      case 'assistant/message': console.log(`${when} [asst] ${short(blocksToText(e.data.message && e.data.message.content), 240)}`); break;
      case 'turn/start': console.log(`${when} [turn/start] turn=${e.data.turn}`); break;
      case 'turn/end': console.log(`${when} [turn/end] turn=${e.data.turn} reason=${reasonStr(e.data.reason)}`); break;
      case 'tool/call': console.log(`${when} [tool] ${e.data.name}(${short(e.data.arguments, 120)})`); break;
      case 'tool/result': console.log(`${when} [tool-result]${e.data.error ? ' ERROR=' + e.data.error.code : ''} ${short(blocksToText(e.data.message && e.data.message.content), 120)}`); break;
      case 'todo/write': console.log(`${when} [todo] ${(e.data.todos || []).filter((t) => !t.status).map((t) => t.content || t.task).join('; ')}`); break;
      default: console.log(`${when} [${e.type}] ${short(JSON.stringify(e.data || {}), 120)}`);
    }
  }
}

async function cmdModels(argv) {
  const { i, base } = await getInstanceSet(argv);
  const sid = argVal(argv, '--session');
  if (!sid) throw new Error('falta --session <id>');
  const r = await rpc(base, 'session.models', { sessionId: sid });
  const v = r.value || {};
  console.log(`== DSH[${i}] ${sid} · modelo actual: ${v.current && v.current.provider}/${v.current && v.current.model}${v.current && v.current.reasoningEffort ? ' (effort:' + v.current.reasoningEffort + ')' : ''} · routable=${v.routable}`);
  console.log('== Proveedores / modelos disponibles ==');
  for (const g of v.groups || []) {
    console.log(`\n[${g.id}] ${g.name}`);
    for (const m of g.models || []) {
      const eff = m.reasoning ? ` [effort: ${(m.reasoning.efforts || []).map((e) => e.id).join(',')}${m.reasoning.defaultEffort ? ' default=' + m.reasoning.defaultEffort : ''}]` : '';
      console.log(`   ${m.id}${m.description ? '  — ' + m.description : ''}${eff}`);
    }
  }
  for (const f of v.failures || []) console.log(`\n!! proveedor ${f.id} (${f.name}) FALLÓ: ${f.message}`);
}

async function cmdSetModel(argv) {
  const { i, base } = await getInstanceSet(argv);
  const sid = argVal(argv, '--session');
  const provider = argVal(argv, '--provider');
  const model = argVal(argv, '--model');
  if (!sid || !provider || !model) throw new Error('faltan --session, --provider y --model');
  const payload = { sessionId: sid, provider, model };
  const eff = argVal(argv, '--effort');
  if (eff) payload.reasoningEffort = eff;
  const r = await rpc(base, 'session.selectModel', payload);
  console.log('modelo seleccionado: ' + JSON.stringify(r.value || r));
}

// Live pending questions + queued prompts via the mux WebSocket.
function answersOnce(base, ms = 2200) {
  return new Promise((resolve) => {
    let done = false;
    const rows = [];
    const finish = () => { if (done) return; done = true; clearTimeout(timer); try { ws && ws.close(); } catch {} resolve(rows); };
    const timer = setTimeout(finish, ms);
    let ws;
    try { ws = new WebSocket(base.replace('http', 'ws') + '/api/events.mux'); }
    catch (e) { resolve([{ error: 'WebSocket no disponible: ' + e.message }]); return; }
    ws.onmessage = (ev) => {
      let f = {};
      try { f = JSON.parse(ev.data); } catch { return; }
      if (f.type === 'question/requested') {
        const qs = (f.questions || []).map((q) => (q && (q.question || q.text || q.prompt)) || JSON.stringify(q));
        rows.push({ tipo: 'PREGUNTA', sessionId: f.sessionId, q: qs.slice(0, 4) });
      } else if (f.type === 'approval/requested') {
        rows.push({ tipo: 'APROBACION', sessionId: f.sessionId, tool: f.toolName, reason: f.reason });
      } else if (f.type === 'session/queue') {
        const qi = (f.items || []).filter((x) => x.placement === 'queued').map((x) => blocksToText(x.message && x.message.content));
        if (qi.length) rows.push({ tipo: 'COLA', sessionId: f.sessionId, msgs: qi.slice(0, 3) });
      }
    };
    ws.onclose = finish;
    ws.onerror = finish;
  });
}

async function cmdAnswers(argv) {
  const { i, base } = await getInstanceSet(argv);
  const rows = await answersOnce(base);
  console.log(`== DSH[${i}] · esperas/preguntas pendientes (snapshot 2s) ==`);
  if (!rows.length) { console.log('  (sin preguntas ni aprobaciones ni cola pendientes ahora mismo)'); return; }
  for (const r of rows) {
    if (r.error) { console.log('  ' + r.error); continue; }
    const extra = r.q ? r.q.map((q) => `? ${short(q, 160)}`).join(' / ') : (r.msgs ? r.msgs.map((m) => `cola> ${short(m, 120)}`).join(' / ') : (r.reason ? `razón: ${short(r.reason, 160)}` : ''));
    console.log(`  ${r.tipo} en sesión ${r.sessionId}${r.tool ? ' (' + r.tool + ')' : ''}: ${extra}`);
  }
}

const cmd = process.argv[2];
const glob = process.argv.slice(2);
(async () => {
  try {
    switch (cmd) {
      case 'instances': return await cmdDescribe();
      case 'list': return await cmdList(glob);
      case 'status': return await cmdStatus(glob);
      case 'new': return await cmdNew(glob);
      case 'prompt': return await cmdPrompt(glob);
      case 'cancel': return await cmdCancel(glob);
      case 'history': return await cmdHistory(glob);
      case 'models': return await cmdModels(glob);
      case 'set-model': return await cmdSetModel(glob);
      case 'answers': return await cmdAnswers(glob);
      default:
        console.log(`dsh-ctrl — uso:
  instances                     lista las 2 instancias y su estado
  list [--instance N] [--filter <término>]   lista sesiones (título, estado, cwd)
  status [--instance N] [--all|--session <id>|--filter <txt>]   estado de una/varias sesión
  new --instance N --cwd <ruta>              crea una sesión nueva
  prompt --instance N --session <id> <texto>  envía un mensaje (cola) al agente
  prompt --instance N --session <id> --text "..."   (igual, con --text)
  cancel --instance N --session <id>          detiene el turno activo
  history --instance N --session <id> [--n 25]  muestra últimos eventos
  models --instance N --session <id>          lista todos los modelos de todos los proveedores + el modelo actual
  set-model --instance N --session <id> --provider <prov> --model <model> [--effort <id>]   cambia el modelo de una sesión
  answers [--instance N]                      esperas: preguntas/aprobaciones/cola`);
    }
  } catch (e) {
    console.error('ERROR: ' + e.message);
    process.exit(1);
  }
})();