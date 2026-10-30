// =====================================================================
// asignaturasController.js — la "cocina": lo que se hace con cada petición
// =====================================================================
//
// Cada función de este archivo atiende UNA petición: recibe req (lo que
// llega) y res (lo que se responde), usa el store para leer o cambiar los
// datos y contesta con el código HTTP correcto.
//
// Códigos que se usan aquí:
//   200 OK            todo bien, se devuelven datos
//   201 Created       se ha creado algo nuevo
//   204 No Content    todo bien y no hay nada que devolver (borrado)
//   404 Not Found     lo que se pide no existe
//
// Este controlador es la TANDA 1. Todavía falta validar los datos de POST
// y añadir PUT y PATCH (tanda 2), y los filtros avanzados (tanda 3).

const store = require('../data/store');

// Los únicos campos que el cliente puede enviar. Cualquier otro (incluido
// "id", que lo pone el servidor) se descarta.
const CAMPOS = ['nombre', 'creditos', 'curso', 'obligatoria', 'area'];

// ---------------------------------------------------------------------
// Utilidades internas
// ---------------------------------------------------------------------

// Se queda solo con los campos permitidos del cuerpo de la petición.
function soloCamposPermitidos(body) {
  const limpio = {};
  const origen = body && typeof body === 'object' ? body : {};
  for (const campo of CAMPOS) {
    if (origen[campo] !== undefined) {
      limpio[campo] = origen[campo];
    }
  }
  return limpio;
}

// El id llega en la URL como TEXTO ("3"). Aquí se convierte a número.
// Si no es un entero positivo ("abc", "-1", "2.5") devuelve null.
function leerId(req) {
  return /^\d+$/.test(req.params.id) ? Number(req.params.id) : null;
}

// Respuesta 404 en JSON, la misma en todas las funciones.
function noEncontrada(res) {
  return res.status(404).json({ error: 'Asignatura no encontrada' });
}

// Minúsculas y sin tildes, para que buscar "algebra" encuentre "Álgebra".
function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// ---------------------------------------------------------------------
// GET /asignaturas        (también: ?curso=2&area=etica&search=alg)
// ---------------------------------------------------------------------
// req.query contiene lo que va después del "?" en la URL, ya separado:
//   /asignaturas?curso=2  ->  req.query = { curso: '2' }
// Todo llega como TEXTO, por eso hay que convertir "2" a número.
function listar(req, res) {
  const { curso, area, search } = req.query;

  let lista = store.findAll();

  // Cada filtro solo se aplica si el cliente lo ha enviado.
  if (curso !== undefined) {
    lista = lista.filter((a) => a.curso === Number(curso));
  }
  if (area !== undefined) {
    lista = lista.filter((a) => a.area === area);
  }
  if (search !== undefined) {
    const buscado = normalizar(search.trim());
    lista = lista.filter((a) => normalizar(a.nombre).includes(buscado));
  }

  res.json(lista);
}

// ---------------------------------------------------------------------
// GET /asignaturas/:id
// ---------------------------------------------------------------------
// :id es un parámetro de la ruta; llega en req.params.id.
function obtener(req, res) {
  const id = leerId(req);

  // Si el id no es un número, no puede existir ninguna asignatura con él.
  const asignatura = id === null ? undefined : store.findById(id);

  if (!asignatura) return noEncontrada(res);
  res.json(asignatura);
}

// ---------------------------------------------------------------------
// POST /asignaturas
// ---------------------------------------------------------------------
// El cuerpo (req.body) lo ha convertido express.json() en app.js.
// TANDA 2: aquí se validará antes de guardar y se responderá 400 si falla.
function crear(req, res) {
  const creada = store.create(soloCamposPermitidos(req.body));

  // 201 + cabecera Location con la dirección del recurso nuevo.
  res.status(201).location(`/asignaturas/${creada.id}`).json(creada);
}

// ---------------------------------------------------------------------
// DELETE /asignaturas/:id
// ---------------------------------------------------------------------
function eliminar(req, res) {
  const id = leerId(req);

  // store.remove devuelve false si no existía.
  if (id === null || !store.remove(id)) return noEncontrada(res);

  // 204: se ha borrado y no hay cuerpo que devolver.
  res.status(204).end();
}

module.exports = { listar, obtener, crear, eliminar };
