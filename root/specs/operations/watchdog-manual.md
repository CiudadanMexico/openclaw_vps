# Watchdog Operational Manual

El Watchdog es el proceso de supervisión que asegura que el sistema no se quede "colgado" y que las tareas progresen.

## 1. Monitoreo de Heartbeat
Para cada tarea en estado `RUNNING`, el Watchdog espera una señal de vida:
- **Técnica:** Registro de logs reciente, actualización de timestamp en `task.yaml` o salida de stdout.
- **Frecuencia:** Cada 5 minutos para tareas Normal/SemiHeavy; cada 15 min para Heavy.

## 2. Detección de Tareas Atoradas (Stuck Tasks)
Una tarea se marca como `SUSPECTED_STUCK` si:
- `current_duration` > `expected_duration` * 2.
- No hay cambios en los logs en los últimos 10 minutos.
- El consumo de CPU es 0% mientras la tarea debería estar procesando.

## 3. Protocolo de Recuperación
Cuando se detecta una tarea `SUSPECTED_STUCK`:
1. **Diagnóstico:** El Watchdog revisa `top` o `ps` para ver si el proceso sigue vivo.
2. **Alerta:** Notifica a ROOT: "Tarea [ID] sospechosa de estar atorada".
3. **Acción:**
   - Si es `LIGHT/NORMAL` $\rightarrow$ `RESTART` automático (máx 3 veces).
   - Si es `HEAVY/CRITICAL` $\rightarrow$ `PAUSE` y solicitar `HUMAN_REVIEW`.

## 4. Recheck Scheduler
El Watchdog gestiona las tareas en `WAITING` con `recheck_at`. Al llegar la hora, mueve la tarea a `QUEUED`.