# Skill: ssh.exec

- **ID:** `ssh.exec`
- **Purpose:** Ejecutar comandos remotos en servidores autorizados.
- **Inputs:** 
  - `host`: string (Hostname o IP)
  - `command`: string (Comando a ejecutar)
- **Outputs:** 
  - `stdout`: string
  - `stderr`: string
  - `exit_code`: integer
- **Permissions:** `infrastructure.write`
- **Risk Level:** R2 (Medium) - Puede alterar el estado del servidor.
- **Verification:** Validar que `exit_code === 0` y, si es un comando de instalación, verificar que el binario esté presente en el sistema.
- **Resource Class:** NORMAL