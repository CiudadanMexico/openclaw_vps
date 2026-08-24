# Resource Manager Specification

Este documento define la lógica para el monitoreo y gestión de recursos del host.

## 1. Métricas a Monitorear
- **CPU:** `% uso total`, `load average (1, 5, 15 min)`.
- **RAM:** `total_mb`, `used_mb`, `available_mb`, `% uso`.
- **Disk I/O:** `utilización de disco %`, `espacio libre`.
- **Network:** `latencia`, `ancho de banda disponible`.

## 2. Niveles de Presión (Resource Pressure)
| Nivel | CPU % | RAM % | Estado | Acción del Orquestador |
| :--- | :---: | :---: | :---: | :--- |
| **LOW** | < 40% | < 40% | Saludable | `RUN_NOW` cualquier clase. |
| **NORMAL**| 40-70% | 40-70% | Estable | `RUN_NOW` Light/Normal. `QUEUE` SemiHeavy. |
| **ELEVATED**| 70-90% | 70-90% | Presionado | `QUEUE` todo excepto Light/Critical. |
| **HIGH** | > 90% | > 90% | Crítico | `DENY` todo excepto Critical/Sudo. |

## 3. Headroom Operativo
Se reserva siempre un **20% de CPU y RAM** como margen de seguridad para evitar que el sistema colapse durante una tarea pesada.