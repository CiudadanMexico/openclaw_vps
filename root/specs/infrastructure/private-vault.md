# Private Vault Specifications

Define la gestión de información sensible y secreta.

## 1. Estructura del Vault
`/root/private/`
  - `credentials/`: API Keys, Tokens, SSH Private Keys.
  - `session/`: Tokens de sesión activos, cookies de autenticación.
  - `internal-memory/`: Reflexiones privadas del agente, análisis de vulnerabilidades internas.
  - `sensitive/`: Datos personales del usuario o clientes.

## 2. Protocolos de Acceso
- **Cifrado en Reposo:** Siempre que sea posible, los archivos en `credentials/` deben estar cifrados.
- **Acceso Just-in-Time:** ROOT solo carga el secreto en la memoria RAM del proceso justo antes de la ejecución y lo limpia inmediatamente después.
- **Prohibición de Logs:** Está estrictamente prohibido escribir cualquier valor contenido en `root/private/` en los logs de `root/logs/` o en el `journal/`.