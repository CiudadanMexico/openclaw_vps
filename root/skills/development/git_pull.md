# Skill: git.pull

- **ID:** `git.pull`
- **Purpose:** Actualizar el repositorio local con los cambios del remoto.
- **Inputs:** 
  - `repo_path`: string (Ruta absoluta al repo)
  - `branch`: string (Rama a actualizar)
- **Outputs:** 
  - `log`: string (Output de git pull)
- **Permissions:** `development.write`
- **Risk Level:** R1 (Low) - Puede causar conflictos de merge.
- **Verification:** Ejecutar `git status` para confirmar que el repo está "up to date".
- **Resource Class:** NORMAL