# Spec: Workspace Architecture 1.0

Esta especificación define la estructura lógica y física donde reside la inteligencia y la operatividad del agente ROOT.

## Estructura de Directorios
El sistema se organiza en la raíz `/root/` con las siguientes capas:

### 1. Capa de Identidad y Configuración
- `identity/`: Define quién es el agente, sus roles y capacidades.
- `config/`: Parámetros operativos y runtime.

### 2. Capa de Conocimiento Permanente (The Map)
- `specs/`: Descripción de "cómo funciona" el sistema (infraestructura, proyectos, servicios).
- `policies/`: Definición de "qué está permitido" (seguridad, reglas de negocio).
- `knowledge/`: Información estable y datos de referencia.

### 3. Capa de Memoria y Continuidad
- `memory/`: Aprendizajes, decisiones tomadas y preferencias consolidadas.
- `journal/`: Bitácora diaria de actividades y decisiones (Humana).
- `logs/`: Registros técnicos de ejecución (Máquina).

### 4. Capa Operativa (The Engine)
- `inbox/`: Entrada de instrucciones.
- `tasks/`: Ciclo de vida de las tareas (Pending $\rightarrow$ Active $\rightarrow$ Verified).
- `queues/`: Colas de ejecución según prioridad y consumo de recursos.
- `approvals/`: Gestión de autorizaciones humanas.

### 5. Capa de Salida y Soporte
- `reports/`: Resultados consolidados.
- `artifacts/`: Archivos generados por tareas.
- `skills/`: Catálogo de capacidades atómicas.
- `subagents/`: Definición de especialistas.
- `integrations/`: Configuración de conexiones externas.

## Principios de Diseño
- **Legibilidad:** Debe ser comprensible para un humano vía VS Code u Obsidian.
- **Procesabilidad:** Estructura optimizada para que el agente recupere contexto rápidamente.
- **Auditoría:** Cada cambio debe dejar rastro en el journal o los logs.