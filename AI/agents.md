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

Los datos se guardan solo en memoria (`src/data/store.js`) y arrancan con las asignaturas del plan de estudios. Al reiniciar el servidor se pierden los cambios.

## Prompt o configuración

Configuración del agente: `.claude/agents/api-tester.md`. Convenciones de los tests: `.claude/skills/api-test-conventions/SKILL.md`.

Prompt usado en Claude Code (con la API arrancada con `npm start`):

```text
Use the api-tester agent to test the API running at http://localhost:3000.
Use only the contract in README.md. Do not read src/ or public/.
Write black-box checks in tests/ and report the result.
```

## Comprobaciones generadas

Resultado global (informe del agente, 16:20 del 2026-11-02): escribió 67 pruebas con `node:test` y `fetch`, repartidas en `tests/health.test.js` y `tests/asignaturas.test.js`, sin dependencias nuevas. No leyó `src/` ni `public/`. Las 67 pasan (`node --test tests/*.test.js`). Cada prueba borra lo que crea: después `/asignaturas/stats` seguía mostrando las mismas 19 asignaturas.

| Identificador | Petición | Resultado esperado (README) | Resultado observado | Decisión |
|---|---|---|---|---|
| T-01 | `GET /health` y `GET /ruta-inexistente` | 200 `status ok` y 404 `Route not found` | Coincide | Aceptada |
| T-02 | `GET /asignaturas` con `search`, `area`, `obligatoria`, `curso` | Solo las asignaturas que cumplen cada filtro | Coincide | Aceptada |
| T-03 | `GET /asignaturas` con `sort`/`order` y `limit`/`offset`, y el ejemplo combinado del README | Orden y paginación correctos | Coincide | Aceptada |
| T-04 | `GET /asignaturas` con parámetros desconocidos, inválidos o repetidos (`color=rojo`, `curso=0`, `limit=1.5`, `area=etica&area=sistemas`…) | 400 con errores | Coincide (13 casos) | Aceptada |
| T-05 | `GET /asignaturas/stats` | 200 con todos los campos, coherente con el listado | Coincide | Aceptada |
| T-06 | `GET /asignaturas/:id` existente, inexistente y no numérico | 200 / 404 `Subject not found` / 404 | Coincide | Aceptada |
| T-07 | `POST /asignaturas` válido | 201, `Location` y la asignatura creada; el `id` del cliente y los campos desconocidos se ignoran | Coincide | Aceptada |
| T-08 | `POST` con datos inválidos (cuerpo vacío, nombre corto o largo, créditos 0/13/4.5, curso 0/6/2.5, área mal escrita, JSON mal formado) | 400 con todos los errores a la vez | Coincide | Aceptada |
| T-09 | `PUT` completo, con campo ausente o inválido, e inexistente | 200 / 400 / 404; el `id` del cuerpo se ignora | Coincide | Aceptada |
| T-10 | `PATCH` con un campo, con campo inválido, sin campos, solo campos desconocidos e inexistente | 200 / 400 / 400 / 400 / 404 | Coincide | Aceptada |
| T-11 | `DELETE` existente, luego `GET`, e inexistente | 204 sin cuerpo, luego 404, y 404 | Coincide | Aceptada |
| T-12 | `npm test` (script original `node --test tests/`) | Ejecutar las pruebas | Falla en Node 24 con «Cannot find module» antes de ejecutar ninguna prueba. El agente no tocó el script | Aceptada: se cambió el script a `node --test tests/*.test.js` |
| T-13 | Ordenar por `nombre` con tildes | El README no dice cómo se ordenan | Orden por caracteres: «Cálculo» queda después de «Computación». El agente indicó que no incumple el README, pero que un usuario esperaría orden alfabético español | Anotada como limitación; coincide con el hallazgo R-02 del reviewer |
| T-14 | Tipos estrictos: `creditos: "6"` y `obligatoria: "true"` | El README no lo detalla | La API los rechaza con 400; el agente lo interpretó como lo que quiere decir el README | Aceptada: es lo que queremos |
| T-15 | 500 por fallo inesperado | 500 `{ error }` | No se puede provocar desde fuera, así que no se prueba | Sin prueba (no es comprobable en caja negra) |
| T-16 | Comprobar que las pruebas detectan fallos: se cambió a propósito el código del `POST` para devolver 200 en vez de 201 | Deben fallar | Fallaron 3 de 67: «devuelve 201, Location…», «ignora el id enviado…» y «acepta nombre de 3 y de 80 caracteres» (`200 !== 201`). Al revertir, volvieron las 67 | Aceptada: las pruebas detectan errores reales |

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

Resultado global (informe del agente, 16:30 del 2026-11-02): «la API de `src/` está bien, pero el cliente de `public/` tiene un fallo grave y varios medios». Solo leyó el código y no cambió nada. No leyó en detalle `asistente.css`, `calculadora.css` ni `salidas.css`, ni revisó las imágenes. Antes de decidir se comprobó a mano el código de los hallazgos.

| Identificador | Hallazgo del agente | Gravedad | Verificación propia | Decisión |
|---|---|---|---|---|
| R-01 | `public/asistente.js:146`: `elegirPregunta` pasa el objeto pregunta entero y se muestra `.texto` (la pregunta) en lugar de `.respuesta`; las preguntas de Grado, Admisión y Salidas se repiten en vez de responderse | GRAVE | Se releyó el código y se reprodujo | Aceptado y corregido: `mostrarAsistente({ texto: pregunta.respuesta, lista: pregunta.lista, enlace: pregunta.enlace })` |
| R-02 | `asignaturasController.js:105-109`: la ordenación compara con `<` y `>`, así que «Álgebra» o «Ética…» salen después de «z» en el `GET /asignaturas` por defecto. Propone `localeCompare(b, 'es', { sensitivity: 'base' })` | MEDIO | Coincide con la duda del tester (T-13) | Real; no se aplica en esta entrega (queda como mejora) |
| R-03 | `public/app.js:58`: la consulta se construye sin codificar. «I&D» provoca 400, «C++» se busca como «c» y «#» corta la URL. Propone `encodeURIComponent` o `URLSearchParams` | MEDIO | Se releyó el código y es real | Real; no se aplica en esta entrega (queda como mejora) |
| R-04 | `public/app.js:315`: se pide el listado en cada tecla y nunca se descartan las respuestas tardías; con red lenta la lista puede no coincidir con lo escrito. Propone un contador de petición o `AbortController` | MEDIO | Real según el código; difícil de ver en local | Real; no se aplica en esta entrega (queda como mejora) |
| R-05 | `src/app.js:59-69`: el manejador de errores solo reconoce el JSON mal formado, así que un cuerpo de más de 100 KB (debería ser 413) o un charset no admitido (415) devolverían 500. El agente aclara que no lo ejecutó | MEDIO | Se probó: el cuerpo grande sí devuelve 500 en vez de 413 (cierto). Con la cabecera `Content-Type` con charset devuelve 400, no 415 (esa parte era falsa) | Parcialmente aceptado: el 413 es real y no se corrige en esta entrega; la parte del 415 se rechaza por no ser cierta |
| R-06 | LEVE: `SIN_API` se modifica al asignar `respuesta.enlace` (`asistente.js:135`); `peticionActual` no sube al volver a «Elige un curso» (`calculadora.js:36-39`); el validador usa `nombre.trim()` pero el controlador guarda el nombre sin recortar; un 400 de un campo sin `span` (`body`, `obligatoria`) no se muestra; falta `className = 'acciones'` en la celda de acciones; un comentario dice que el aviso desaparece y no lo hace | LEVE | No se comprobaron uno a uno | Anotados; no se aplican |
| R-07 | Código sin usar y duplicado: `#est-areas`, el campo `palabras` de `PERFILES`, tres exports del controlador sin importar, selectores CSS sin uso, `NOMBRES_AREA` repetido en dos archivos, la lista de áreas repetida en cuatro sitios, `getStats` con cuatro bucles | LEVE | No se comprobaron uno a uno | Anotado; no se aplica |
| R-08 | `asignaturas.html:2` conserva el texto de plantilla «Autores: Nombre Apellidos…»; el `<nav>` es distinto en cada página (por ejemplo `asignatura-detalle.html` no enlaza a Salidas) | LEVE | Hay que comprobarlo en el repositorio | Pendiente: sustituir por los nombres reales de los autores antes de entregar |

Lo que el agente valoró bien: estructura de la API (routes, controller, validator, store y logger), códigos HTTP (201 con `Location`, 204, 404), errores en JSON sin mostrar la traza, validación estricta de tipos, campos desconocidos e `id` del cliente ignorados, el store devuelve copias, no hay `innerHTML`, todos los `fetch` comprueban `response.ok`, hay estados de carga, error y vacío, y accesibilidad básica (etiquetas, `alt`, foco visible).
