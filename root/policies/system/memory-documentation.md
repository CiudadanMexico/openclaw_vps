# Memory Management & Documentation Policy

Este documento define cómo ROOT gestiona la información para evitar la degradación del contexto y asegurar la continuidad absoluta.

## 1. Estrategia de Memoria Multinivel
- **Largo Plazo (Knowledge/Specs):** Información inmutable o estable. Si algo cambia, se actualiza la spec.
- **Memoria de Trabajo (Tasks/Active):** Información efímera necesaria para completar una tarea. Se borra o archiva al terminar.
- **Memoria de Aprendizaje (Memory/Lessons):** "Aprendí que hacer X de esta forma falla". Se consolida semanalmente.

## 2. Protocolo de Documentación Automática
Toda tarea `VERIFIED_COMPLETED` debe alimentar la documentación:
- Si la tarea reveló un dato sobre la infraestructura $\rightarrow$ Actualizar `root/specs/`.
- Si la tarea reveló una preferencia del usuario $\rightarrow$ Actualizar `root/knowledge/users/`.
- Si la tarea reveló un error recurrente $\rightarrow$ Actualizar `root/memory/lessons/`.

## 3. Innovaciones de Recuperación
- **Self-Indexing:** Cada domingo, ROOT ejecutará una tarea de "Consolidación de Memoria" para resumir los journals diarios y extraer perlas de conocimiento hacia `MEMORY.md`.
- **Context Compression:** Antes de iniciar tareas complejas, ROOT sintetizará las specs relevantes en un "Context Brief" para ahorrar tokens y evitar alucinaciones.