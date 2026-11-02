const { test, after } = require("node:test");
const assert = require("node:assert/strict");

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

const AREAS = ["programacion", "matematicas", "datos-ia", "sistemas", "etica"];
const CAMPOS = ["id", "nombre", "creditos", "curso", "obligatoria", "area"];
const PREFIJO = "Zzqtest";

const creados = new Set();

function valida(extra = {}) {
  return {
    nombre: `${PREFIJO} Asignatura`,
    creditos: 6,
    curso: 3,
    obligatoria: true,
    area: "datos-ia",
    ...extra,
  };
}

function enviar(method, path, body) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function crear(extra = {}) {
  const response = await enviar("POST", "/asignaturas", valida(extra));
  const body = await response.json();
  if (body && Number.isInteger(body.id)) creados.add(body.id);
  return { response, body };
}

async function borrar(id) {
  await fetch(`${baseUrl}/asignaturas/${id}`, { method: "DELETE" });
  creados.delete(id);
}

async function idInexistente() {
  const response = await fetch(`${baseUrl}/asignaturas`);
  const lista = await response.json();
  return Math.max(0, ...lista.map((a) => a.id)) + 100000;
}

after(async () => {
  for (const id of [...creados]) await borrar(id);
});

// ---------- GET /asignaturas ----------

test("GET /asignaturas devuelve 200 y un array", async () => {
  const response = await fetch(`${baseUrl}/asignaturas`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body));
});

test("GET /asignaturas devuelve elementos con los campos del recurso", async () => {
  const response = await fetch(`${baseUrl}/asignaturas`);
  const body = await response.json();

  assert.equal(response.status, 200);
  for (const a of body) {
    assert.deepEqual(Object.keys(a).sort(), [...CAMPOS].sort());
    assert.ok(Number.isInteger(a.id));
    assert.equal(typeof a.nombre, "string");
    assert.ok(Number.isInteger(a.creditos));
    assert.ok(Number.isInteger(a.curso));
    assert.equal(typeof a.obligatoria, "boolean");
    assert.ok(AREAS.includes(a.area));
  }
});

test("GET /asignaturas?search filtra por nombre sin distinguir mayusculas", async () => {
  const { body: creada } = await crear({ nombre: `${PREFIJO} Busqueda` });
  const response = await fetch(`${baseUrl}/asignaturas?search=${PREFIJO.toUpperCase()}%20BUSQ`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.some((a) => a.id === creada.id));
  assert.ok(body.every((a) => a.nombre.toLowerCase().includes(`${PREFIJO} busq`.toLowerCase())));
  await borrar(creada.id);
});

test("GET /asignaturas?area filtra por area", async () => {
  const response = await fetch(`${baseUrl}/asignaturas?area=matematicas`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.length > 0);
  assert.ok(body.every((a) => a.area === "matematicas"));
});

test("GET /asignaturas?obligatoria=false devuelve solo optativas", async () => {
  const { body: creada } = await crear({ nombre: `${PREFIJO} Optativa`, obligatoria: false });
  const response = await fetch(`${baseUrl}/asignaturas?obligatoria=false`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.some((a) => a.id === creada.id));
  assert.ok(body.every((a) => a.obligatoria === false));
  await borrar(creada.id);
});

test("GET /asignaturas?obligatoria=true devuelve solo obligatorias", async () => {
  const response = await fetch(`${baseUrl}/asignaturas?obligatoria=true`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.every((a) => a.obligatoria === true));
});

test("GET /asignaturas?curso filtra por curso", async () => {
  const response = await fetch(`${baseUrl}/asignaturas?curso=2`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.length > 0);
  assert.ok(body.every((a) => a.curso === 2));
});

test("GET /asignaturas ordena por nombre asc por defecto", async () => {
  const a = await crear({ nombre: `${PREFIJO} Bbb` });
  const b = await crear({ nombre: `${PREFIJO} Aaa` });
  const c = await crear({ nombre: `${PREFIJO} Ccc` });
  const response = await fetch(`${baseUrl}/asignaturas?search=${PREFIJO}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.map((x) => x.nombre), [`${PREFIJO} Aaa`, `${PREFIJO} Bbb`, `${PREFIJO} Ccc`]);
  for (const x of [a, b, c]) await borrar(x.body.id);
});

test("GET /asignaturas?sort=creditos&order=desc ordena por creditos descendente", async () => {
  const response = await fetch(`${baseUrl}/asignaturas?sort=creditos&order=desc`);
  const body = await response.json();

  assert.equal(response.status, 200);
  for (let i = 1; i < body.length; i++) assert.ok(body[i - 1].creditos >= body[i].creditos);
});

test("GET /asignaturas?sort=curso ordena por curso ascendente", async () => {
  const response = await fetch(`${baseUrl}/asignaturas?sort=curso`);
  const body = await response.json();

  assert.equal(response.status, 200);
  for (let i = 1; i < body.length; i++) assert.ok(body[i - 1].curso <= body[i].curso);
});

test("GET /asignaturas?sort=area&order=desc ordena por area descendente", async () => {
  const response = await fetch(`${baseUrl}/asignaturas?sort=area&order=desc`);
  const body = await response.json();

  assert.equal(response.status, 200);
  for (let i = 1; i < body.length; i++) assert.ok(body[i - 1].area >= body[i].area);
});

test("GET /asignaturas?limit&offset pagina el resultado", async () => {
  const todos = await (await fetch(`${baseUrl}/asignaturas`)).json();
  const response = await fetch(`${baseUrl}/asignaturas?limit=2&offset=1`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, todos.slice(1, 3));
});

test("GET /asignaturas con filtros combinados (ejemplo del README)", async () => {
  const { body: creada } = await crear({ nombre: `${PREFIJO} Machine Learning`, creditos: 9 });
  const response = await fetch(
    `${baseUrl}/asignaturas?search=${PREFIJO}%20machine&area=datos-ia&sort=creditos&order=desc&limit=1`
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, [creada]);
  await borrar(creada.id);
});

test("GET /asignaturas?color=rojo devuelve 400 con errores", async () => {
  const response = await fetch(`${baseUrl}/asignaturas?color=rojo`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.ok(Array.isArray(body.errors));
  assert.equal(body.errors[0].field, "color");
  for (const p of ["search", "area", "obligatoria", "curso", "sort", "order", "limit", "offset"]) {
    assert.ok(body.errors[0].message.includes(p));
  }
});

for (const qs of [
  "area=otra",
  "obligatoria=si",
  "curso=0",
  "curso=6",
  "curso=abc",
  "sort=id",
  "order=up",
  "limit=0",
  "limit=abc",
  "limit=1.5",
  "offset=-1",
  "offset=abc",
  "area=etica&area=sistemas",
]) {
  test(`GET /asignaturas?${qs} devuelve 400`, async () => {
    const response = await fetch(`${baseUrl}/asignaturas?${qs}`);

    assert.equal(response.status, 400);
  });
}

// ---------- GET /asignaturas/stats ----------

test("GET /asignaturas/stats devuelve 200 con todos los campos", async () => {
  const response = await fetch(`${baseUrl}/asignaturas/stats`);
  const body = await response.json();

  assert.equal(response.status, 200);
  for (const k of ["total", "obligatorias", "optativas", "creditosTotales", "porArea", "porCurso"]) {
    assert.ok(k in body, `falta ${k}`);
  }
});

test("GET /asignaturas/stats es coherente con el listado", async () => {
  const lista = await (await fetch(`${baseUrl}/asignaturas`)).json();
  const response = await fetch(`${baseUrl}/asignaturas/stats`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.total, lista.length);
  assert.equal(body.obligatorias, lista.filter((a) => a.obligatoria).length);
  assert.equal(body.optativas, lista.filter((a) => !a.obligatoria).length);
  assert.equal(body.creditosTotales, lista.reduce((s, a) => s + a.creditos, 0));
  const sumaArea = Object.values(body.porArea).reduce((s, n) => s + n, 0);
  const sumaCurso = Object.values(body.porCurso).reduce((s, n) => s + n, 0);
  assert.equal(sumaArea, lista.length);
  assert.equal(sumaCurso, lista.length);
});

// ---------- GET /asignaturas/:id ----------

test("GET /asignaturas/:id devuelve 200 con la asignatura", async () => {
  const { body: creada } = await crear();
  const response = await fetch(`${baseUrl}/asignaturas/${creada.id}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, creada);
  await borrar(creada.id);
});

test("GET /asignaturas/:id inexistente devuelve 404 Subject not found", async () => {
  const id = await idInexistente();
  const response = await fetch(`${baseUrl}/asignaturas/${id}`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, { error: "Subject not found" });
});

test("GET /asignaturas/:id no numerico devuelve 404", async () => {
  const response = await fetch(`${baseUrl}/asignaturas/abc`);

  assert.equal(response.status, 404);
});

// ---------- POST /asignaturas ----------

test("POST /asignaturas devuelve 201, Location y la asignatura creada", async () => {
  const { response, body } = await crear();

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("location"), `/asignaturas/${body.id}`);
  assert.ok(Number.isInteger(body.id));
  assert.deepEqual(body, { id: body.id, ...valida() });
  await borrar(body.id);
});

test("POST /asignaturas ignora el id enviado y los campos desconocidos", async () => {
  const id = await idInexistente();
  const { response, body } = await crear({ id, color: "rojo" });

  assert.equal(response.status, 201);
  assert.notEqual(body.id, id);
  assert.deepEqual(Object.keys(body).sort(), [...CAMPOS].sort());
  await borrar(body.id);
});

test("POST /asignaturas persiste la asignatura creada", async () => {
  const { body: creada } = await crear();
  const response = await fetch(`${baseUrl}/asignaturas/${creada.id}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, creada);
  await borrar(creada.id);
});

test("POST /asignaturas con datos invalidos devuelve 400 con todos los errores", async () => {
  const response = await enviar("POST", "/asignaturas", {
    nombre: "Ab", creditos: 20, curso: 3, obligatoria: "si", area: "otra",
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body.errors.map((e) => e.field).sort(), ["area", "creditos", "nombre", "obligatoria"]);
  for (const e of body.errors) assert.equal(typeof e.message, "string");
});

test("POST /asignaturas con cuerpo vacio devuelve 400 con los cinco campos", async () => {
  const response = await enviar("POST", "/asignaturas", {});
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body.errors.map((e) => e.field).sort(), ["area", "creditos", "curso", "nombre", "obligatoria"]);
});

for (const [campo, valor] of [
  ["nombre", "x".repeat(81)],
  ["nombre", 123],
  ["creditos", 0],
  ["creditos", 13],
  ["creditos", 4.5],
  ["creditos", "6"],
  ["curso", 0],
  ["curso", 6],
  ["curso", 2.5],
  ["obligatoria", "true"],
  ["area", "Etica"],
]) {
  test(`POST /asignaturas con ${campo}=${JSON.stringify(valor).slice(0, 20)} devuelve 400`, async () => {
    const response = await enviar("POST", "/asignaturas", valida({ [campo]: valor }));
    const body = await response.json();
    if (response.status === 201 && body.id) await borrar(body.id);

    assert.equal(response.status, 400);
    assert.deepEqual(body.errors.map((e) => e.field), [campo]);
  });
}

test("POST /asignaturas acepta nombre de 3 y de 80 caracteres", async () => {
  const r1 = await crear({ nombre: "Abc" });
  const r2 = await crear({ nombre: "Z".repeat(80) });

  assert.equal(r1.response.status, 201);
  assert.equal(r2.response.status, 201);
  await borrar(r1.body.id);
  await borrar(r2.body.id);
});

test("POST /asignaturas con JSON mal formado devuelve 400", async () => {
  const response = await enviar("POST", "/asignaturas", '{"nombre": "x",');

  assert.equal(response.status, 400);
});

// ---------- PUT /asignaturas/:id ----------

test("PUT /asignaturas/:id devuelve 200 con la asignatura reemplazada", async () => {
  const { body: creada } = await crear();
  const nueva = valida({ nombre: `${PREFIJO} Reemplazada`, creditos: 4, curso: 1, obligatoria: false, area: "etica" });
  const response = await enviar("PUT", `/asignaturas/${creada.id}`, nueva);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { id: creada.id, ...nueva });
  await borrar(creada.id);
});

test("PUT /asignaturas/:id persiste el reemplazo", async () => {
  const { body: creada } = await crear();
  const nueva = valida({ nombre: `${PREFIJO} Persistida`, creditos: 3 });
  await enviar("PUT", `/asignaturas/${creada.id}`, nueva);
  const response = await fetch(`${baseUrl}/asignaturas/${creada.id}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { id: creada.id, ...nueva });
  await borrar(creada.id);
});

test("PUT /asignaturas/:id ignora el id del cuerpo", async () => {
  const { body: creada } = await crear();
  const response = await enviar("PUT", `/asignaturas/${creada.id}`, valida({ id: creada.id + 5000 }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.id, creada.id);
  await borrar(creada.id);
});

test("PUT /asignaturas/:id con un campo ausente devuelve 400", async () => {
  const { body: creada } = await crear();
  const { area, ...sinArea } = valida();
  const response = await enviar("PUT", `/asignaturas/${creada.id}`, sinArea);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body.errors.map((e) => e.field), ["area"]);
  await borrar(creada.id);
});

test("PUT /asignaturas/:id con un campo invalido devuelve 400", async () => {
  const { body: creada } = await crear();
  const response = await enviar("PUT", `/asignaturas/${creada.id}`, valida({ curso: 9 }));

  assert.equal(response.status, 400);
  await borrar(creada.id);
});

test("PUT /asignaturas/:id inexistente devuelve 404", async () => {
  const id = await idInexistente();
  const response = await enviar("PUT", `/asignaturas/${id}`, valida());

  assert.equal(response.status, 404);
});

// ---------- PATCH /asignaturas/:id ----------

test("PATCH /asignaturas/:id devuelve 200 y cambia solo el campo enviado", async () => {
  const { body: creada } = await crear();
  const response = await enviar("PATCH", `/asignaturas/${creada.id}`, { creditos: 9 });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ...creada, creditos: 9 });
  await borrar(creada.id);
});

test("PATCH /asignaturas/:id persiste el cambio", async () => {
  const { body: creada } = await crear();
  await enviar("PATCH", `/asignaturas/${creada.id}`, { obligatoria: false });
  const response = await fetch(`${baseUrl}/asignaturas/${creada.id}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ...creada, obligatoria: false });
  await borrar(creada.id);
});

test("PATCH /asignaturas/:id con campo invalido devuelve 400", async () => {
  const { body: creada } = await crear();
  const response = await enviar("PATCH", `/asignaturas/${creada.id}`, { creditos: 20 });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body.errors.map((e) => e.field), ["creditos"]);
  await borrar(creada.id);
});

test("PATCH /asignaturas/:id sin campos devuelve 400", async () => {
  const { body: creada } = await crear();
  const response = await enviar("PATCH", `/asignaturas/${creada.id}`, {});

  assert.equal(response.status, 400);
  await borrar(creada.id);
});

test("PATCH /asignaturas/:id con solo campos desconocidos devuelve 400", async () => {
  const { body: creada } = await crear();
  const response = await enviar("PATCH", `/asignaturas/${creada.id}`, { color: "rojo" });

  assert.equal(response.status, 400);
  await borrar(creada.id);
});

test("PATCH /asignaturas/:id inexistente devuelve 404", async () => {
  const id = await idInexistente();
  const response = await enviar("PATCH", `/asignaturas/${id}`, { creditos: 6 });

  assert.equal(response.status, 404);
});

// ---------- DELETE /asignaturas/:id ----------

test("DELETE /asignaturas/:id devuelve 204 sin cuerpo", async () => {
  const { body: creada } = await crear();
  const response = await fetch(`${baseUrl}/asignaturas/${creada.id}`, { method: "DELETE" });
  const texto = await response.text();
  creados.delete(creada.id);

  assert.equal(response.status, 204);
  assert.equal(texto, "");
});

test("DELETE /asignaturas/:id hace que luego GET devuelva 404", async () => {
  const { body: creada } = await crear();
  await borrar(creada.id);
  const response = await fetch(`${baseUrl}/asignaturas/${creada.id}`);

  assert.equal(response.status, 404);
});

test("DELETE /asignaturas/:id inexistente devuelve 404", async () => {
  const id = await idInexistente();
  const response = await fetch(`${baseUrl}/asignaturas/${id}`, { method: "DELETE" });

  assert.equal(response.status, 404);
});
