# Práctica 1 — Foundations API: Asignaturas

API REST y cliente web sobre las **asignaturas** del Grado en Ciencia de Datos e Inteligencia Artificial de CUNEF Universidad. Continúa el sitio de los laboratorios del bloque I (página semántica, estilos responsive y funciones de validación).

## Integrantes

- Álvaro Martínez Rubio
- Javier Chico Alonso

## Cómo ejecutarlo

Requiere Node.js 18 o superior.

```bash
npm install
npm start        # http://localhost:3000
npm run dev      # reinicia al guardar cambios
```

Comprobación rápida: `curl http://localhost:3000/health` responde `{"status":"ok"}`.

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

## Contenido estático

`express.static` se instala en `src/app.js`, después de `express.json()` y del logger, y antes de las rutas de la API y del 404. Sirve la carpeta `public/` desde el mismo servidor que la API, así que la página y la API comparten origen y no hace falta configurar CORS.

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

## Ejemplos de petición y respuesta

Crear una asignatura (el `id` y los campos desconocidos se ignoran):

```bash
curl -i -X POST http://localhost:3000/asignaturas -H "Content-Type: application/json" \
  -d '{"nombre":"Machine Learning","creditos":6,"curso":3,"obligatoria":true,"area":"datos-ia","id":999}'
```
```text
HTTP/1.1 201 Created
Location: /asignaturas/20
{"id":20,"nombre":"Machine Learning","creditos":6,"curso":3,"obligatoria":true,"area":"datos-ia"}
```

Crear con datos inválidos (devuelve todos los errores a la vez):

```bash
curl -i -X POST http://localhost:3000/asignaturas -H "Content-Type: application/json" \
  -d '{"nombre":"Ab","creditos":20,"curso":3,"obligatoria":"si","area":"otra"}'
```
```text
HTTP/1.1 400 Bad Request
{"errors":[{"field":"nombre","message":"El nombre debe tener entre 3 y 80 caracteres"},
{"field":"creditos","message":"Los créditos deben ser un número entero entre 1 y 12"},
{"field":"obligatoria","message":"obligatoria debe ser true o false"},
{"field":"area","message":"El área debe ser una de: programacion, matematicas, datos-ia, sistemas, etica"}]}
```

Actualizar solo un campo con PATCH:

```bash
curl -X PATCH http://localhost:3000/asignaturas/20 -H "Content-Type: application/json" -d '{"creditos":9}'
```
```text
{"id":20,"nombre":"Machine Learning","creditos":9,"curso":3,"obligatoria":true,"area":"datos-ia"}
```

Buscar, filtrar, ordenar y limitar:

```bash
curl "http://localhost:3000/asignaturas?search=machine&area=datos-ia&sort=creditos&order=desc&limit=1"
```
```text
[{"id":20,"nombre":"Machine Learning","creditos":9,"curso":3,"obligatoria":true,"area":"datos-ia"}]
```

Parámetro desconocido (política: se responde 400):

```bash
curl -i "http://localhost:3000/asignaturas?color=rojo"
```
```text
HTTP/1.1 400 Bad Request
{"errors":[{"field":"color","message":"Parámetro desconocido. Admitidos: search, area, obligatoria, curso, sort, order, limit, offset"}]}
```

Asignatura inexistente y borrado:

```text
GET    /asignaturas/9999  ->  404 {"error":"Subject not found"}
DELETE /asignaturas/20    ->  204 (sin cuerpo)
```

## Páginas adicionales de `public/`

`index.html` es la aplicación principal (listado, formulario, búsqueda, filtros y estados). Además hay páginas de los laboratorios (`plan-estudios.html`, `admision.html`, `noticias.html`, `asignatura-detalle.html`), una calculadora de nota media (`calculadora-notas.html`), un asistente de preguntas (`asistente.html`) y una página de salidas profesionales. La calculadora y el asistente consultan la API con `fetch`, pero no guardan datos.

