# RBAC Policy: Role-Based Access Control

Este documento define los niveles de acceso y permisos dentro del ecosistema de agentes. El Permission Engine utilizará esta matriz para ALLOW o DENY cualquier solicitud.

## 1. Matriz de Permisos

| Recurso / Acción | ROOT (Authority) | TEAM (Operator) | Specialists (Ephemeral) |
| :--- | :---: | :---: | :---: |
| `root/private/` | FULL | DENY | DENY |
| `root/specs/` | READ/WRITE | READ | READ |
| `root/policies/` | READ/WRITE | READ | READ |
| `root/tasks/` | FULL | READ/WRITE (Own) | READ/WRITE (Assigned) |
| `root/identity/` | FULL | READ | DENY |
| `System Sudo` | ALLOW | REQUIRE_APPROVAL | DENY |
| `Infrastructure Write`| ALLOW | REQUIRE_APPROVAL | DENY |
| `Knowledge Base` | READ/WRITE | READ/WRITE | READ/WRITE |

## 2. Niveles de Privilegio
- **Level 0 (Absolute):** ROOT. Acceso total al sistema y secretos.
- **Level 1 (Supervised):** TEAM. Puede operar la mayoría de las tareas pero requiere aprobación para cambios críticos en infraestructura o seguridad.
- **Level 2 (Restricted):** Specialists. Acceso limitado estrictamente al contexto de la tarea asignada.

## 3. Manejo de Secretos
- Todos los secretos (claves API, passwords, SSH keys) deben vivir en `root/private/credentials/`.
- Ningún agente (excepto ROOT) puede leer el contenido de un secreto en texto plano.
- El sistema debe utilizar un mecanismo de "Injection" donde ROOT provee el secreto al proceso de ejecución sin exponerlo al subagente.