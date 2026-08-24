# Skill: docker.inspect

- **ID:** `docker.inspect`
- **Purpose:** Obtener información detallada de un contenedor, imagen o volumen.
- **Inputs:** 
  - `target_id`: string (ID o nombre del contenedor/imagen)
- **Outputs:** 
  - `json_config`: string (Configuración completa en JSON)
- **Permissions:** `infrastructure.read`
- **Risk Level:** R0 (Trivial) - Solo lectura.
- **Verification:** Validar que la respuesta JSON sea válida y no esté vacía.
- **Resource Class:** LIGHT