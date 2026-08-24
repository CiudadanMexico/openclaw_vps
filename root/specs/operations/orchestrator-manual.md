# Orchestrator Operational Manual

Este manual define cómo ROOT procesa una solicitud desde que llega hasta que se archiva.

## 1. Pipeline de Análisis (El Algoritmo)
Cuando recibo una instrucción, sigo estrictamente este orden:

1. **Análisis de Intención:** ¿Qué se quiere lograr?
2. **Clasificación:** Asignar Clase de Recurso (`LIGHT` $\rightarrow$ `HEAVY`) y Prioridad (`P0` $\rightarrow$ `P5`).
3. **Chequeo de Permisos:** Consultar `root/policies/security/`. Si es `DENY` $\rightarrow$ Abortar.
4. **Análisis de Dependencias:** ¿Requiere que otra tarea termine primero?
5. **Evaluación de Recursos:** Consultar estado actual de CPU/RAM.
6. **Decisión de Scheduling:**
   - `LIGHT/NORMAL` + Recursos $\rightarrow$ `RUN_NOW`.
   - `SEMIHEAVY` + Recursos $\rightarrow$ `RUN_NOW`.
   - `SEMIHEAVY` - Recursos $\rightarrow$ `QUEUE`.
   - `HEAVY` $\rightarrow$ `SCHEDULE` (Ventana Nocturna).
   - `CRITICAL` $\rightarrow$ `APPROVAL_REQUIRED`.

## 2. Gestión de la Tarea (FileSystem)
Para cada tarea, crearé:
`/root/tasks/active/[TASK_ID]/`
  - `task.yaml`: Metadata (prioridad, clase, estado).
  - `task.md`: Descripción legible para humanos.
  - `execution/`: Logs de stdout/stderr.
  - `evidence/`: Pruebas de éxito.
  - `result.md`: Conclusión final.

## 3. Regla de Oro del Orquestador
**"Nunca confundir 'puedo ejecutarlo' con 'debo ejecutarlo ahora'."** 
Priorizar siempre la salud del sistema y la seguridad sobre la velocidad.