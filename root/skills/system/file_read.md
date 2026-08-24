# Skill: file.read

- **ID:** `file.read`
- **Purpose:** Leer el contenido de un archivo de texto.
- **Inputs:** 
  - `path`: string (Ruta al archivo)
- **Outputs:** 
  - `content`: string
- **Permissions:** `system.read`
- **Risk Level:** R0 (Trivial)
- **Verification:** Validar que el archivo exista y que el contenido no sea nulo.
- **Resource Class:** LIGHT