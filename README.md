# Práctica 1 — Foundations API: Asignaturas

API REST con Node.js y Express, y un cliente web con HTML, CSS y JavaScript sin frameworks, para gestionar las asignaturas del Grado en Ciencia de Datos e Inteligencia Artificial de CUNEF Universidad. Continúa el sitio de los laboratorios del bloque I.

## Integrantes y recurso

- Álvaro Martínez Rubio
- Javier Chico Alonso

**Tema:** plan de estudios. **Recurso único:** `asignatura`. Los datos se guardan solo en memoria.

## Cómo ejecutarlo

Requiere Node.js 18 o superior.

```bash
npm install
npm start        # servidor en http://localhost:3000
npm run dev      # igual, pero se reinicia al guardar cambios
npm test         # pruebas (con el servidor ya arrancado, en otra terminal)
```

- `npm start` arranca el servidor. `npm run dev` lo arranca y lo reinicia al guardar cambios (usa `node --watch`).
- El puerto por defecto es el 3000. Se puede cambiar con la variable `PORT`: en un archivo `.env` en la raíz (`PORT=4000`) o en la propia orden (`PORT=4000 npm start`). El `.env` es opcional y no se sube al repositorio.
- `npm test` ejecuta las pruebas de `tests/`, que hacen peticiones HTTP a la API en marcha. Si el servidor está en otro puerto: `BASE_URL=http://localhost:4000 npm test`.
- Comprobación rápida: `curl http://localhost:3000/health` responde `{"status":"ok"}`.

## El recurso `asignatura`

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | entero | Lo genera el servidor. Si el cliente lo envía, se ignora. |
| `nombre` | texto | Obligatorio. De 3 a 80 caracteres. |
| `creditos` | entero | Obligatorio. De 1 a 12 ECTS. |
| `curso` | entero | Obligatorio. De 1 a 5. |
| `obligatoria` | booleano | Obligatorio. `true` = obligatoria, `false` = optativa. |
| `area` | texto, valores cerrados | Obligatorio. Uno de: `programacion`, `matematicas`, `datos-ia`, `sistemas`, `etica`. |

Los campos que no estén en la tabla no se guardan. Los tipos son estrictos: `"6"` o `"true"` entre comillas se rechazan.

## Endpoints

| Método | Ruta | Parámetros de consulta | Éxito | Errores |
|---|---|---|---|---|
| GET | `/asignaturas` | `search`, `area`, `obligatoria`, `curso`, `sort`, `order`, `limit`, `offset` | 200 con un array | 400 si un parámetro es desconocido o inválido |
| GET | `/asignaturas/stats` | — | 200 con el resumen (calculado en cada petición) | — |
| GET | `/asignaturas/:id` | — | 200 con la asignatura | 404 si no existe o el id no es numérico |
| POST | `/asignaturas` | — | 201, cabecera `Location` y la asignatura creada | 400 con todos los fallos a la vez |
| PUT | `/asignaturas/:id` | — | 200 con la asignatura reemplazada | 400 si falta o falla algún campo; 404 |
| PATCH | `/asignaturas/:id` | — | 200 con la asignatura modificada | 400 si un campo es inválido o no se envía ninguno; 404 |
| DELETE | `/asignaturas/:id` | — | 204 sin cuerpo | 404 |

### Rutas generales (fuera del recurso)

| Método | Ruta | Respuesta correcta | Notas |
|---|---|---|---|
| GET | `/health` | 200 `{"status":"ok"}` | Comprueba que el servidor está vivo. |
| GET | `/echo/:message` | 200 `{"echo":"<message>"}` | Ejemplo de clase de parámetro de ruta: `/echo/hola` responde `{"echo":"hola"}`, y `/echo/a%20b` responde `{"echo":"a b"}`. Sin texto (`/echo` o `/echo/`) responde 404. |
| GET | `/` | 200, la página `index.html` (HTML) | Contenido estático de `public/`. |
| GET | `/<archivo>` de `public/` | 200 con el archivo (por ejemplo `/asignaturas.html` o `/styles.css`) | Contenido estático. Si el archivo no existe, 404 JSON. |

Estas rutas no forman parte del recurso `asignatura` y solo admiten GET: con otro método (por ejemplo `POST /health`) responden 404 `{"error":"Route not found"}`.

### Otras respuestas

- Ruta inexistente: 404 `{"error":"Route not found"}`.
- Asignatura inexistente: 404 `{"error":"Subject not found"}`.
- JSON mal formado: 400 `{"errors":[{"field":"body","message":"..."}]}`.
- Fallo inesperado: 500 `{"error":"Internal server error"}`, sin enseñar la traza.
- Los errores 400 de validación tienen siempre la forma `{"errors":[{"field":"...","message":"..."}]}`.

### Parámetros de `GET /asignaturas`

Se pueden combinar.

| Parámetro | Valores | Por defecto |
|---|---|---|
| `search` | texto contenido en el nombre, sin distinguir mayúsculas | — |
| `area` | `programacion`, `matematicas`, `datos-ia`, `sistemas`, `etica` | — |
| `obligatoria` | `true` o `false` | — |
| `curso` | de 1 a 5 | — |
| `sort` | `nombre`, `creditos`, `curso`, `area` | `nombre` |
| `order` | `asc` o `desc` | `asc` |
| `limit` | entero ≥ 1 | sin límite (devuelve todo) |
| `offset` | entero ≥ 0 | 0 |

### Ejemplos de petición y respuesta

**Crear** (el `id` enviado se ignora):

```bash
curl -i -X POST http://localhost:3000/asignaturas -H "Content-Type: application/json" \
  -d '{"nombre":"Machine Learning","creditos":6,"curso":3,"obligatoria":true,"area":"datos-ia","id":999}'
```
```
HTTP/1.1 201 Created
Location: /asignaturas/20

{"id":20,"nombre":"Machine Learning","creditos":6,"curso":3,"obligatoria":true,"area":"datos-ia"}
```

**Crear con datos inválidos** (devuelve todos los errores a la vez):

```bash
curl -i -X POST http://localhost:3000/asignaturas -H "Content-Type: application/json" \
  -d '{"nombre":"Ab","creditos":20,"curso":3,"obligatoria":"si","area":"otra"}'
```
```
HTTP/1.1 400 Bad Request

{"errors":[
  {"field":"nombre","message":"El nombre debe tener entre 3 y 80 caracteres"},
  {"field":"creditos","message":"Los créditos deben ser un número entero entre 1 y 12"},
  {"field":"obligatoria","message":"obligatoria debe ser true o false"},
  {"field":"area","message":"El área debe ser una de: programacion, matematicas, datos-ia, sistemas, etica"}]}
```

**Reemplazar con PUT** (se envían los cinco campos):

```bash
curl -X PUT http://localhost:3000/asignaturas/20 -H "Content-Type: application/json" \
  -d '{"nombre":"Machine Learning","creditos":6,"curso":3,"obligatoria":false,"area":"datos-ia"}'
```
```
{"id":20,"nombre":"Machine Learning","creditos":6,"curso":3,"obligatoria":false,"area":"datos-ia"}
```

**Modificar un campo con PATCH:**

```bash
curl -X PATCH http://localhost:3000/asignaturas/20 -H "Content-Type: application/json" -d '{"creditos":9}'
```
```
{"id":20,"nombre":"Machine Learning","creditos":9,"curso":3,"obligatoria":false,"area":"datos-ia"}
```

**Buscar, filtrar, ordenar y limitar:**

```bash
curl "http://localhost:3000/asignaturas?search=machine&area=datos-ia&sort=creditos&order=desc&limit=1"
```
```
[{"id":20,"nombre":"Machine Learning","creditos":9,"curso":3,"obligatoria":false,"area":"datos-ia"}]
```

**Resumen** (con los datos iniciales, antes de crear nada):

```bash
curl http://localhost:3000/asignaturas/stats
```
```
{"total":19,"obligatorias":19,"optativas":0,"creditosTotales":126,
 "porArea":{"programacion":3,"matematicas":4,"datos-ia":7,"sistemas":4,"etica":1},
 "porCurso":{"1":4,"2":3,"3":4,"4":4,"5":4}}
```

**Parámetro desconocido:**

```bash
curl -i "http://localhost:3000/asignaturas?color=rojo"
```
```
HTTP/1.1 400 Bad Request

{"errors":[{"field":"color","message":"Parámetro desconocido. Admitidos: search, area, obligatoria, curso, sort, order, limit, offset"}]}
```

**Inexistente y borrado:**

```
GET    /asignaturas/9999  ->  404 {"error":"Subject not found"}
DELETE /asignaturas/20    ->  204 (sin cuerpo)
```

## Política de parámetros desconocidos

Se **rechazan con 400** y un mensaje que lista los parámetros admitidos. Lo mismo ocurre con un valor inválido (`?curso=9`) o un parámetro repetido (`?area=etica&area=sistemas`). Así un error tipográfico (`?aera=etica`) no devuelve en silencio la lista sin filtrar.

## Contenido estático

`express.static` se instala en `src/app.js`, después de `express.json()` y del logger y **antes** de las rutas de la API y del 404. Sirve la carpeta `public/` desde el mismo servidor que la API. Así la página y la API comparten origen, y no hace falta configurar CORS.

## Por qué el filtrado se hace en el servidor

El cliente solo recibe las asignaturas que cumplen la búsqueda y los filtros: no se descarga todo el catálogo para filtrarlo en el navegador. Además, cualquier otro cliente de la API (curl, otra aplicación) obtiene el mismo comportamiento sin reimplementar la lógica, y las reglas se validan en un único sitio.

## Diferencia entre PUT y PATCH

- **PUT** sustituye la asignatura entera, por eso exige los cinco campos. Si falta uno, responde 400.
- **PATCH** cambia solo los campos enviados, y cada uno se valida con las mismas reglas. Si no se envía ningún campo, responde 400.

**El cliente usa POST para crear y PUT para editar**, porque su formulario siempre envía todos los campos.

## Estructura

```
src/
  server.js                              arranca el servidor
  app.js                                 middlewares, rutas, 404 y manejador de errores
  middleware/logger.js                   registro de peticiones
  routes/asignaturas.js                  conecta método + URL con el controlador
  controllers/asignaturasController.js   lee la petición, usa el store y responde
  data/store.js                          almacenamiento en memoria
  validators/asignaturasValidator.js     validateAsignatura(body, { partial })
public/                                  cliente web
tests/                                   pruebas de caja negra (node:test + fetch)
AI/                                      agents.md y review-log.md
.claude/                                 configuración de los agentes (tester y code reviewer)
```

## Cliente web (`public/`)

- **`asignaturas.html` + `app.js`**: la aplicación del recurso. Listado, formulario de creación y edición, buscador y filtros (área, tipo y curso) que construyen la consulta para la API, ordenación, resumen, y estados de carga, error y lista vacía. Cada fila tiene Editar y Eliminar. Los errores 400 se muestran junto a cada campo, y se comprueba `response.ok` en cada `fetch`.
- **`index.html`**: portada del sitio de los laboratorios, que enlaza a la aplicación. El profesor indicó en clase que las funciones pueden repartirse entre páginas.
- Páginas de los laboratorios: `plan-estudios.html`, `admision.html`, `noticias.html`, `asignatura-detalle.html`.
- Extras que consultan la API con `fetch` y no guardan datos: `calculadora-notas.html` (nota media), `asistente.html` (preguntas y respuestas preparadas) y `salidas-profesionales.html`.

## Agentes de IA

La carpeta `AI/` documenta el trabajo con agentes:
- **Tester** (caja negra): solo recibió este README y la API en marcha, y generó las pruebas de `tests/`.
- **Code reviewer** (adicional, caja blanca y solo lectura): revisó `src/` y `public/`.

`AI/agents.md` recoge la configuración, el contrato y las comprobaciones, y `AI/review-log.md` recoge lo que se aceptó, corrigió o rechazó, y por qué.

## Limitaciones conocidas

Detectadas en la revisión y no corregidas en esta entrega (detalle en `AI/review-log.md`): la ordenación por texto no trata bien las tildes, el buscador no codifica caracteres como `&` o `#`, y un cuerpo JSON de más de 100 KB devuelve 500 en lugar de 413.
