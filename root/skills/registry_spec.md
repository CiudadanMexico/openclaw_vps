# Skill Registry Specification

Este documento define el estándar para la creación y registro de skills en el sistema ROOT. Una skill no es solo un comando, es un contrato operativo.

## 1. Estructura de una Skill (Contrato)
Cada skill debe estar documentada en `root/skills/[categoría]/[nombre].md` con los siguientes campos:

- **ID:** Identificador único (ej. `ssh.exec`).
- **Purpose:** Qué hace y para qué sirve.
- **Inputs:** Parámetros requeridos y sus tipos.
- **Outputs:** Qué devuelve la skill al finalizar.
- **Permissions:** Permisos de RBAC necesarios para ejecutarla.
- **Risk Level:** R0 (Trivial) a R4 (Sistémico).
- **Verification:** El método obligatorio para validar que la skill funcionó (ej. "checar exit code 0 y presencia de archivo X").
- **Resource Class:** LIGHT, NORMAL, SEMIHEAVY, o HEAVY.

## 2. Categorías de Skills
- `system/`: Operaciones base del OS y gestión de ROOT.
- `infrastructure/`: SSH, Docker, Nginx, Redes.
- `development/`: Git, NPM, Python, Compiladores.
- `database/`: Queries, Backups, Migraciones.
- `web/`: HTTP requests, Scraping, DNS.
- `business/`: Cotizaciones, Prospectos, Documentación.
- `multimedia/`: FFmpeg, ImageMagick, Generación de assets.