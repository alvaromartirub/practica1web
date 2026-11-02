# Tester agent

## Contrato recibido

El agente recibe solo esto: la tabla de campos y la tabla de endpoints del `README.md`, más la API en ejecución en `http://localhost:3000`. No tiene acceso a `src/`.

## Recurso: `asignatura`

Cada elemento representa una asignatura del plan de estudios (`plan-estudios.html`).

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | número entero | Lo genera el servidor. Si el cliente lo envía, se ignora. |
| `nombre` | texto | Obligatorio. De 3 a 80 caracteres. |
| `creditos` | número entero | Obligatorio. De 1 a 12 ECTS. |
| `curso` | número entero | Obligatorio. De 1 a 5. |
| `obligatoria` | booleano | Obligatorio. `true` = obligatoria, `false` = optativa. |
| `area` | texto, valores cerrados | Obligatorio. Uno de: `programacion`, `matematicas`, `datos-ia`, `sistemas`, `etica`. |

Los campos que no estén en la tabla no se guardan.

## Endpoints

| Método | Ruta | Éxito | Errores |
|---|---|---|---|
| GET | `/asignaturas` | 200 con un array de asignaturas | 400 si un parámetro es desconocido o inválido |
| GET | `/asignaturas/stats` | 200 con `total`, `obligatorias`, `optativas`, `creditosTotales`, `porArea`, `porCurso` | |
| GET | `/asignaturas/:id` | 200 con la asignatura | 404 si no existe o el id no es numérico |
| POST | `/asignaturas` | 201, cabecera `Location` y la asignatura creada | 400 `{ errors: [{ field, message }] }` (todos los fallos a la vez) |
| PUT | `/asignaturas/:id` | 200 con la asignatura reemplazada | 400 si falta o falla algún campo; 404 |
| PATCH | `/asignaturas/:id` | 200 con la asignatura modificada | 400 si un campo enviado es inválido o no se envía ninguno; 404 |
| DELETE | `/asignaturas/:id` | 204 sin cuerpo | 404 |

Cualquier ruta inexistente responde 404 `{ "error": "Route not found" }`; un JSON mal formado, 400; un fallo inesperado, 500 `{ "error": ... }`.

### Parámetros de `GET /asignaturas`

| Parámetro | Valores | Por defecto |
|---|---|---|
| `search` | texto contenido en el nombre (sin distinguir mayúsculas) | |
| `area` | `programacion`, `matematicas`, `datos-ia`, `sistemas`, `etica` | |
| `obligatoria` | `true` / `false` | |
| `curso` | 1–5 | |
| `sort` | `nombre`, `creditos`, `curso`, `area` | `nombre` |
| `order` | `asc` / `desc` | `asc` |
| `limit` | entero ≥ 1 | sin límite (se devuelve todo) |
| `offset` | entero ≥ 0 | 0 |

**Parámetros desconocidos:** se rechazan con 400 y un mensaje que lista los admitidos (también un valor inválido o un parámetro repetido). Así un error tipográfico (`?aera=etica`) no devuelve en silencio la lista sin filtrar.

### PUT frente a PATCH

PUT sustituye la asignatura entera, por eso exige los cinco campos. PATCH cambia solo los campos enviados, y cada uno se valida con las mismas reglas. **El cliente usa POST para crear y PUT para editar**, porque su formulario siempre envía todos los campos.

### Por qué el filtrado se hace en el servidor

El cliente solo recibe las asignaturas que cumplen la búsqueda y los filtros. Así no se descarga todo el catálogo para filtrarlo en el navegador, y cualquier otro cliente de la API obtiene el mismo comportamiento sin reimplementarlo.

Los datos se guardan solo en memoria (`src/data/store.js`) y arrancan con las asignaturas del plan de estudios, más tres Minors optativos. Al reiniciar el servidor se pierden los cambios.

## Prompt o configuración

Configuración del agente: `.claude/agents/api-tester.md`. Convenciones de los tests: `.claude/skills/api-test-conventions/SKILL.md`.

Prompt usado en Claude Code (con la API arrancada con `npm start`):

```text
Use the api-tester agent to test the API running at http://localhost:3000.
Use only the contract in README.md. Do not read src/ or public/.
Write black-box checks in tests/ and report the result.
```

## Comprobaciones generadas

> Rellenar después de ejecutar el agente: una fila por comprobación relevante.

| Identificador | Petición | Resultado esperado | Resultado observado | Decisión |
|---|---|---|---|---|
| T-01 | Pendiente | Pendiente | Pendiente | Pendiente |

---

# Agente adicional: code reviewer

Agente de **caja blanca** y de solo lectura. A diferencia del tester (que solo ve el contrato y la API en marcha), este agente lee `src/` y `public/` y dice si el código está bien o mal: errores, casos sin controlar, riesgos de seguridad y problemas de claridad. No modifica ningún fichero.

## Contrato recibido

El código del repositorio (`src/` y `public/`) y la skill `.claude/skills/code-quality/SKILL.md`, que contiene los criterios de revisión.

## Prompt o configuración

Configuración: `.claude/agents/code-reviewer.md`. Criterios: `.claude/skills/code-quality/SKILL.md`.

Prompt usado en Claude Code:

```text
Use the code-reviewer agent to review src/ and public/.
Apply the criteria of the code-quality skill and report the problems found.
```

## Comprobaciones generadas

> Rellenar después de ejecutar el agente: una fila por hallazgo relevante.

| Identificador | Hallazgo del agente | Gravedad | Verificación propia | Decisión |
|---|---|---|---|---|
| R-01 | Pendiente | Pendiente | Pendiente | Pendiente |
