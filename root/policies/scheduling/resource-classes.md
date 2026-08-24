# Resource Class Specifications

Este documento define las categorías de consumo de recursos para todas las tareas del sistema. El Orchestrator utilizará estas clases para decidir la ejecución inmediata o el encolamiento.

## 1. LIGHT
- **Descripción:** Operaciones de lectura, consultas rápidas o generación de texto corto.
- **Impacto:** Despreciable en CPU/RAM.
- **Ejemplos:** Leer un archivo, consultar una API, listar procesos, búsqueda web simple.
- **Decisión:** `RUN_NOW` (Sujeto a permisos).

## 2. NORMAL
- **Descripción:** Operaciones de consumo moderado que no bloquean el sistema.
- **Impacto:** Uso moderado de CPU/RAM por periodos cortos (< 5 min).
- **Ejemplos:** `git pull`, tests unitarios pequeños, procesamiento de documentos cortos.
- **Decisión:** `RUN_NOW` si existen recursos disponibles.

## 3. SEMIHEAVY
- **Descripción:** Operaciones que consumen recursos significativos o duran periodos medianos.
- **Impacto:** Uso elevado de CPU/RAM o I/O prolongado.
- **Ejemplos:** `npm install`, builds medianos, transcodificación de audio, compresión de archivos.
- **Decisión:** `QUEUE` si el sistema está bajo presión; `RUN` si hay margen operativo (Headroom).

## 4. HEAVY
- **Descripción:** Operaciones de alto impacto o larguísima duración.
- **Impacto:** Saturación potencial de CPU/GPU/RAM o I/O masivo.
- **Ejemplos:** Fine-tuning de modelos, renderizado de video, backups masivos, migraciones de DB grandes.
- **Decisión:** `SCHEDULE` exclusivamente para la Ventana Horaria HEAVY (Default: 00:00 - 06:00).

## 5. CRITICAL
- **Descripción:** Operaciones cuyo impacto es sistémico o irreversible, independientemente del recurso.
- **Impacto:** Alto riesgo de caída de servicio o pérdida de datos.
- **Ejemplos:** Deploy a producción, cambios de firewall, borrado de DB.
- **Decisión:** `REQUIRE_APPROVAL` $\rightarrow$ `HUMAN_REVIEW` $\rightarrow$ `RUN`.