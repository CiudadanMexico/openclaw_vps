# Task Lifecycle Specification

Define los estados y el flujo obligatorio que debe seguir toda tarea en el sistema ROOT.

## 1. Flujo Nominal (Happy Path)
`NEW` $\rightarrow$ `PLANNED` $\rightarrow$ `QUEUED` $\rightarrow$ `RUNNING` $\rightarrow$ `VERIFICATION` $\rightarrow$ `VERIFIED_COMPLETED`

## 2. Definición de Estados

### Fase de Preparación
- **NEW:** La tarea ha sido recibida pero no analizada.
- **PLANNED:** El Orchestrator ha definido los pasos, la clase de recurso y la prioridad.
- **QUEUED:** La tarea espera en la cola correspondiente (`critical`, `normal`, `heavy`, etc.).

### Fase de Ejecución
- **RUNNING:** La tarea está siendo ejecutada por un worker o subagente.
- **WAITING:** La tarea está pausada esperando un evento externo (API, respuesta humana, recheck).
- **SUSPECTED_STUCK:** El Watchdog detectó falta de progreso o heartbeat.

### Fase de Cierre
- **VERIFICATION:** El comando terminó, pero se está validando que el objetivo se cumplió.
- **VERIFIED_COMPLETED:** Existe evidencia técnica de que la tarea fue exitosa.
- **FAILED:** La tarea terminó con error. Puede pasar a `RETRYING`.
- **CANCELLED:** La tarea fue abortada por el humano o por ROOT.

## 3. Reglas de Transición
- **No Saltos:** Una tarea no puede pasar de `RUNNING` a `VERIFIED_COMPLETED` sin pasar por `VERIFICATION`.
- **Bloqueo:** Si una tarea falla en `VERIFICATION`, vuelve a `FAILED` o `HUMAN_REVIEW`.
- **Evidencia:** Para pasar a `VERIFIED_COMPLETED`, debe existir un archivo en `tasks/active/[TASK_ID]/evidence/`.