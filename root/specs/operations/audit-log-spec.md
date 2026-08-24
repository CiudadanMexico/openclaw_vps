# Audit Log Specification

Define cómo se registran las decisiones de revisión para asegurar la trazabilidad total.

## 1. Registro de Revisión
Cada revisión debe generar un archivo en `root/logs/audit/[TASK_ID]_audit.md` con el siguiente formato:

- **Task ID:** [ID]
- **Timestamp:** [ISO-8601]
- **Plan Version:** [v1.0]
- **Specialist Recommendation:** [APPROVE/REJECT]
- **Security Assessment:** [PASS/FAIL/NA]
- **Auditor Verdict:** [APPROVED/REJECTED/REVISE]
- **Root Decision:** [EXECUTE/ABORT]
- **Notes:** [Justificación de la decisión]

## 2. Integridad del Log
Los logs de auditoría son de **Alta Integridad**. 
- Prohibido borrar o editar logs de auditoría una vez cerrados.
- Cualquier cambio en un log de auditoría debe generar un nuevo evento de auditoría indicando quién y por qué hizo el cambio.