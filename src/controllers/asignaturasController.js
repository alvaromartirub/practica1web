// El controlador recibe la petición, usa el store y responde.
// No sabe cómo se guardan los datos: solo llama a las funciones de store.js.
 
const store = require('../data/store');
const { validateAsignatura, AREAS } = require('../validators/asignaturasValidator');
 
// Campos que el cliente puede enviar. Los demás (incluido id) se ignoran.
const CAMPOS = ['nombre', 'creditos', 'curso', 'obligatoria', 'area'];
 
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
 
// El id de la URL debe ser un entero positivo; si no, se trata como no encontrado.
function leerId(req) {
  return /^\d+$/.test(req.params.id) ? Number(req.params.id) : null;
}
 
function noEncontrada(res) {
  return res.status(404).json({ error: 'Subject not found' });
}
 
// Parámetros de consulta admitidos. Política: un parámetro desconocido o con
// un valor inválido responde 400 (no se ignora en silencio).
const PARAMS = ['search', 'area', 'obligatoria', 'curso', 'sort', 'order', 'limit', 'offset'];
const CAMPOS_ORDEN = ['nombre', 'creditos', 'curso', 'area'];
 
function entero(valor) {
  return /^\d+$/.test(valor) ? Number(valor) : null;
}
 
// Devuelve { errors } o { consulta } con los valores ya convertidos.
function leerConsulta(query) {
  const errors = [];
  // Sin limit por defecto: si no se pide una ventana, se devuelve todo.
  const consulta = { sort: 'nombre', order: 'asc', offset: 0 };
 
  for (const clave of Object.keys(query)) {
    if (!PARAMS.includes(clave)) {
      errors.push({ field: clave, message: `Parámetro desconocido. Admitidos: ${PARAMS.join(', ')}` });
    }
  }
  // Un parámetro repetido (?area=a&area=b) llega como array: no se admite.
  for (const clave of PARAMS) {
    if (Array.isArray(query[clave])) errors.push({ field: clave, message: 'No se admite repetir el parámetro' });
  }
  if (errors.length) return { errors };
 
  if (query.search !== undefined) consulta.search = query.search.trim().toLowerCase();
  if (query.area !== undefined) {
    if (!AREAS.includes(query.area)) errors.push({ field: 'area', message: `Debe ser una de: ${AREAS.join(', ')}` });
    else consulta.area = query.area;
  }
  if (query.obligatoria !== undefined) {
    if (!['true', 'false'].includes(query.obligatoria)) errors.push({ field: 'obligatoria', message: 'Debe ser true o false' });
    else consulta.obligatoria = query.obligatoria === 'true';
  }
  if (query.curso !== undefined) {
    const n = entero(query.curso);
    if (n === null || n < 1 || n > 5) errors.push({ field: 'curso', message: 'Debe ser un entero entre 1 y 5' });
    else consulta.curso = n;
  }
  if (query.sort !== undefined) {
    if (!CAMPOS_ORDEN.includes(query.sort)) errors.push({ field: 'sort', message: `Debe ser uno de: ${CAMPOS_ORDEN.join(', ')}` });
    else consulta.sort = query.sort;
  }
  if (query.order !== undefined) {
    if (!['asc', 'desc'].includes(query.order)) errors.push({ field: 'order', message: 'Debe ser asc o desc' });
    else consulta.order = query.order;
  }
  if (query.limit !== undefined) {
    const n = entero(query.limit);
    if (n === null || n < 1) errors.push({ field: 'limit', message: 'Debe ser un entero mayor o igual que 1' });
    else consulta.limit = n;
  }
  if (query.offset !== undefined) {
    const n = entero(query.offset);
    if (n === null) errors.push({ field: 'offset', message: 'Debe ser un entero mayor o igual que 0' });
    else consulta.offset = n;
  }
 
  return errors.length ? { errors } : { consulta };
}
 
// Se filtra, se ordena y al final se recorta la ventana (limit/offset).
function listAsignaturas(req, res) {
  const { errors, consulta } = leerConsulta(req.query);
  if (errors) return res.status(400).json({ errors });
 
  let lista = store.list();
  if (consulta.search) lista = lista.filter((a) => a.nombre.toLowerCase().includes(consulta.search));
  if (consulta.area !== undefined) lista = lista.filter((a) => a.area === consulta.area);
  if (consulta.obligatoria !== undefined) lista = lista.filter((a) => a.obligatoria === consulta.obligatoria);
  if (consulta.curso !== undefined) lista = lista.filter((a) => a.curso === consulta.curso);
 
  // Ordenar por el campo elegido. Si order=desc se invierte el resultado.
  const campo = consulta.sort;
  lista.sort((a, b) => {
    if (a[campo] < b[campo]) return -1;
    if (a[campo] > b[campo]) return 1;
    return 0;
  });
  if (consulta.order === 'desc') lista.reverse();
 
  // Ventana de resultados. Sin limit se devuelve hasta el final.
  const fin = consulta.limit === undefined ? undefined : consulta.offset + consulta.limit;
  res.json(lista.slice(consulta.offset, fin));
}
 
// Resumen de todo el catálogo (sin filtros).
function getStats(req, res) {
  const lista = store.list();
  const porArea = {};
  const porCurso = {};
  for (const a of lista) {
    porArea[a.area] = (porArea[a.area] || 0) + 1;
    porCurso[a.curso] = (porCurso[a.curso] || 0) + 1;
  }
  let creditosTotales = 0;
  for (const a of lista) creditosTotales += a.creditos;
  res.json({
    total: lista.length,
    obligatorias: lista.filter((a) => a.obligatoria).length,
    optativas: lista.filter((a) => !a.obligatoria).length,
    creditosTotales,
    porArea,
    porCurso,
  });
}
 
function getAsignatura(req, res) {
  const id = leerId(req);
  const asignatura = id === null ? undefined : store.findById(id);
  if (!asignatura) return noEncontrada(res);
  res.json(asignatura);
}
 
// Valida y devuelve true si hay errores (ya ha respondido 400).
function hayErrores(res, body, partial) {
  const { errors } = validateAsignatura(body, { partial });
  if (errors.length) {
    res.status(400).json({ errors });
    return true;
  }
  return false;
}
 
function createAsignatura(req, res) {
  if (hayErrores(res, req.body, false)) return;
  const creada = store.create(soloCamposPermitidos(req.body));
  res.status(201).location(`/asignaturas/${creada.id}`).json(creada);
}
 
// PUT: sustituye la asignatura entera, así que exige todos los campos.
function replaceAsignatura(req, res) {
  const id = leerId(req);
  if (id === null || !store.findById(id)) return noEncontrada(res);
  if (hayErrores(res, req.body, false)) return;
  res.json(store.replace(id, soloCamposPermitidos(req.body)));
}
 
// PATCH: cambia solo los campos enviados; cada uno se valida igual que en PUT.
function updateAsignatura(req, res) {
  const id = leerId(req);
  if (id === null || !store.findById(id)) return noEncontrada(res);
  if (hayErrores(res, req.body, true)) return;
  res.json(store.update(id, soloCamposPermitidos(req.body)));
}
 
function deleteAsignatura(req, res) {
  const id = leerId(req);
  if (id === null || !store.remove(id)) return noEncontrada(res);
  res.status(204).end();
}
 
module.exports = {
  listAsignaturas,
  getStats,
  getAsignatura,
  createAsignatura,
  replaceAsignatura,
  updateAsignatura,
  deleteAsignatura,
};