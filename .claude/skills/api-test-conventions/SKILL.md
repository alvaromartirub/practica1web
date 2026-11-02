---
name: api-test-conventions
description: Convenciones para escribir comprobaciones HTTP de la API de asignaturas. Úsala siempre que se escriba o revise un test de una ruta de este proyecto.
---

# Convenciones de test de la API

## Herramientas

- Solo el ejecutor de tests de Node.js: `node:test` y `node:assert/strict`.
- No instalar ninguna dependencia nueva.
- Las peticiones se hacen con el `fetch` global, contra una API ya arrancada.

## Ficheros

- Los tests van en la carpeta `tests/`.
- Un fichero por recurso: `tests/asignaturas.test.js`, `tests/health.test.js`.
- Se ejecutan con `npm test`.

## URL de la API

```js
const { test } = require("node:test");
const assert = require("node:assert/strict");

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
```

## Cómo se escribe cada test

- El nombre empieza por el método y la ruta: `"GET /asignaturas devuelve 200 y un array"`.
- Se comprueba primero el status y después el cuerpo.
- Cada test comprueba un único comportamiento.
- Para cada endpoint, al menos un test del caso correcto y uno del caso de error del contrato.
- Los tests que crean datos borran después lo que crearon.

## Ejemplo

```js
test("GET /health devuelve status ok", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: "ok" });
});
```
