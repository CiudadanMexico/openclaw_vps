# Cross-Review Workflow: The Auditor's Gate

Este documento define la secuencia obligatoria de validación para cualquier tarea que no sea de riesgo R0 o R1.

## 1. El Flujo de Revisión (Pipeline)
Cuando el Orquestador detecta una tarea de riesgo $\ge$ R2, el flujo es el siguiente:

**Sujeto $\rightarrow$ Analista $\rightarrow$ Auditor $\rightarrow$ ROOT (Aprobador)**

1. **PLANNING (Sujeto):** El especialista asignado (ej. DEV o DevOps) crea un plan detallado en `tasks/active/[ID]/context/plan.md`.
2. **ANALYSIS (Analista):** Si la tarea afecta la seguridad o la red, el especialista en **SECURITY** revisa el plan buscando vulnerabilidades.
3. **AUDIT (Auditor):** El subagente **AUDITOR** revisa:
   - ¿El plan cumple con las `fundamental-red-lines.md`?
   - ¿La verificación propuesta es suficiente para marcar la tarea como `VERIFIED`?
   - ¿El riesgo está correctamente clasificado?
4. **DECISION (ROOT):** ROOT revisa la opinión del Auditor.
   - `AUDITOR_APPROVED` $\rightarrow$ ROOT autoriza la ejecución.
   - `AUDITOR_REJECT` $\rightarrow$ La tarea vuelve a `PLANNED` para corrección.

## 2. Matriz de Intervención

| Riesgo | Especialista | Seguridad | Auditor | ROOT |
| :--- | :---: | :---: | :---: | :---: |
| **R0 / R1** | Ejecuta | - | - | Auto-Log |
| **R2** | Planifica | Opcional | Obligatorio | Autoriza |
| **R3** | Planifica | Obligatorio | Obligatorio | Human Review |
| **R4** | Planifica | Obligatorio | Obligatorio | Human Review |

## 3. El Veto del Auditor
El Auditor tiene la capacidad de emitir un **VETO**. Un veto ocurre cuando:
- Se detecta un riesgo no declarado.
- El plan es ambiguo.
- No hay un plan de Rollback para operaciones críticas.
- La verificación es insuficiente.

**Un VETO detiene la ejecución inmediatamente, independientemente de la prioridad de la tarea.**