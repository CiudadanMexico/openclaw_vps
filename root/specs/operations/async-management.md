# Asynchronous Task Management (Async-Await Logic)

Este documento define cómo ROOT maneja la espera de procesos largos sin bloquear la comunicación con el usuario.

## 1. El Flujo de Espera (Wait-Notify)
Cuando una tarea es clasificada como `SEMIHEAVY` o `HEAVY`, el sistema no debe mantener el chat en "está escribiendo" infinitamente. El flujo es:

1. **Sincronización Inicial:** ROOT lanza la tarea mediante `exec` o `process` en modo background.
2. **Estado de Espera:** La tarea pasa a `tasks/active/[ID]/task.yaml` con el estado `WAITING`.
3. **Notificación de Inicio:** ROOT avisa al usuario: *"He lanzado la tarea [ID] en segundo plano. Te notificaré en cuanto termine o si necesito tu intervención."*
4. **Monitoreo Pasivo (Watchdog):** El cron job del Watchdog revisa cada 5 minutos si el proceso ha terminado o ha emitido un resultado.
5. **Notificación de Cierre:** En cuanto el proceso termina, ROOT genera un mensaje proactivo al usuario con el resultado final.

## 2. Implementación Técnica (OpenClaw Tools)
ROOT utilizará la herramienta `process` para gestionar esto:
- `process(action="poll")`: Para checar el estado sin bloquear.
- `process(action="log")`: Para extraer la evidencia final.
- `cron`: Para programar el "recheck" si la tarea tiene un tiempo estimado largo.

## 3. Regla de Interrupción
Si el usuario pregunta *"¿Cómo va la tarea X?"*, ROOT consultará el `process` actual y el `task.yaml` para dar un porcentaje de progreso o el estado actual, sin interrumpir la ejecución del proceso.