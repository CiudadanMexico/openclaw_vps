# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup: camera names and locations, SSH hosts and aliases, preferred TTS voices, speaker/room names, device nicknames, anything environment-specific.

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## DeepSeek Harness (DSH) — control e interrogación por `dsh-ctrl`

Hay **2 instancias** de DeepSeek Harness (agentes tipo engine) en la máquina `192.168.1.7`, vía túnel SSH local desde este VPS:

- `--instance 3080` → `http://127.0.0.1:13080` (esta instancia = agente "principal")
- `--instance 3081` → `http://127.0.0.1:13081`

Herramienta local: **`dsh-ctrl`** (comando disponible en el PATH). Úsala cuando Abraham/el equipo pida **supervisar o controlar a los agentes DSH** desde Discord/whatsapp, o coordinar tareas con ellos.

### Comandos
```bash
dsh-ctrl instances                       # ¿las 2 instancias responden?
dsh-ctrl list [--instance 3080] [--filter wikis]   # sesiones: título, estado, carpeta
dsh-ctrl status [--instance 3080] [--session <id>|--all|--filter <txt>]
                                          # ¿está pensando/activa?, último mensaje, goal pendiente, pendientes
dsh-ctrl answers [--instance 3080]        # preguntas/aprobaciones/cola pendientes esperando respuesta
dsh-ctrl prompt --instance 3080 --session <id> --text "el mensaje"
                                          # mandarle un mensaje al agente (cola)
dsh-ctrl new --instance 3080 --cwd "\\192.168.1.7\Kompa\wikis"   # sesión nueva en una carpeta
dsh-ctrl cancel --instance 3080 --session <id>    # detener el turno activo
dsh-ctrl history --instance 3080 --session <id> [--n 30]   # actividad reciente
dsh-ctrl models --instance 3080 --session <id>  # modelo actual + todos los modelos de todos los proveedores
dsh-ctrl set-model --instance 3080 --session <id> --provider <prov> --model <m> [--effort high]
                                          # cambiar el modelo de una sesión (entre todos los proveedores)
```

### Cómo leer el estado
- `ACTIVA/pensando` = el agente está trabajando en esa sesión ahora mismo.
- `idle` = terminó/dejó de pensar (mira `último turno cerró con` y `último assistant`).
- `vacia` = nunca arrancó.
- `GOAL pendiente` = objetivo activo a mediano plazo. `PENDIENTES` = tareas pendientes (todo).
- `answers` → si hay `PREGUNTA`, el agente está esperando respuesta tuya; `APROBACION` = pide permiso; `COLA` = mensajes esperando turno.

### Carpetas de trabajo (cwd) compartidas
`list` muestra la carpeta de cada sesión; suelen estar en `\\192.168.1.7\Kompa\wikis`, `\\192.168.1.7\kompa\wikis`, `\\192.168.1.7\Kompa` o la carpeta de red `kolabo`. Usa `--filter wikis` / `--filter kolabo` para ubicar la sesión correcta.

### Reglas
- Para **continuar/hacer que un agente haga algo**: `prompt` a la sesión cuyo título/carpeta coincida; si no existe una, crea una con `new --cwd`.
- No abras `prompt` a sesiones que estén `vacia` sin necesidad: crea una nueva con `new`.
- **Para **cambiar el modelo**: usa `models` para ver el modelo actual y todos los proveedores, luego `set-model` (proveedores disponibles: `deepseek-official`, `nvidi`, `mi-nvidia`). Cambiar el modelo solo afecta a la sesión indicada.
- Resume en **español** para Abraham.

## Vault de secretos (OpenBao, en el server de Oracle Cloud)

OpenBao corre en `159.54.135.230` y hay un túnel local `127.0.0.1:8200` desde este VPS.
Para leer un secreto sin mostrarlo:

```bash
vauth-get discord token      # -> el token del bot de Discord
vauth-get telegram token
vauth-get nvidia api_key
vauth-get deepseek api_key
vauth-get ssh password
```

Regla: **nunca escribas valores de secretos en un chat ni en archivos del repo** — leelos con
`vauth-get`; y meida los valores NUEVOS directamente en el vault (no por chat),
vía `openbao kv put dsh/<clave> ...` en el server o con el token de uso.

## Related

- [Agent workspace](/concepts/agent-workspace)
