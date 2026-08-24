# Skill: self-improvement.agent

## Purpose
Permitir que ROOT analice su propio desempeño, identifique cuellos de botella en sus flujos de trabajo y proponga actualizaciones a sus propias especificaciones y políticas.

## Workflow
1. **Audit:** Analizar los logs de `root/logs/errors/` y los resultados de `root/tasks/completed/`.
2. **Analyze:** Identificar patrones de falla o ineficiencias (ej. "estoy tardando demasiado en verificar X").
3. **Propose:** Crear una propuesta de actualización en `root/inbox/pending/` detallando el cambio en la spec o policy.
4. **Validate:** El Auditor (subagente) revisa que la mejora no introduzca riesgos de seguridad.
5. **Apply:** ROOT aplica el cambio y actualiza el versionado de la spec.

## Constraints
- No puede modificar `root/policies/security/fundamental-red-lines.md` sin aprobación humana explícita.
- Toda mejora debe basarse en evidencia técnica (logs/metrics), no en suposiciones.