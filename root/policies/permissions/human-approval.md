# Human Approval Framework (HAF)

Define el protocolo para solicitar y procesar autorizaciones humanas en operaciones de alto riesgo.

## 1. Clasificación de Riesgo (R-Scale)
- **R0 (Trivial):** Sin riesgo. Ejecución automática.
- **R1 (Low):** Riesgo mínimo (ej. lectura de logs). Ejecución automática con log.
- **R2 (Medium):** Riesgo moderado (ej. actualización de plugin en staging). Notificar y ejecutar si no hay veto en 5 min.
- **R3 (High):** Riesgo alto (ej. deploy a producción, cambio de DNS). **BLOQUEO OBLIGATORIO**. Requiere respuesta explícita.
- **R4 (Critical):** Riesgo sistémico (ej. borrado de DB, cambio de Firewall). **BLOQUEO OBLIGATORIO + DOBLE VALIDACIÓN**.

## 2. Flujo de Aprobación
1. **Detección:** El Orquestador identifica una tarea R3 o R4.
2. **Creación:** Se crea un archivo en `root/approvals/pending/[APP_ID].md`.
3. **Notificación:** Se envía un mensaje al humano con:
   - Acción solicitada.
   - Motivo y Riesgo.
   - Impacto esperado.
   - Botón/Comando de Aprobación/Rechazo.
4. **Decisión:**
   - `APPROVE` $\rightarrow$ La tarea pasa a `QUEUED` $\rightarrow$ `RUNNING`.
   - `REJECT` $\rightarrow$ La tarea pasa a `CANCELLED`.

## 3. Registro de Auditoría
Toda aprobación debe quedar registrada en `root/approvals/approved/` con:
- Timestamp.
- ID del aprobador.
- Contexto de la decisión.