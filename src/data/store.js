// =====================================================================
// store.js — almacenamiento de asignaturas EN MEMORIA
// =====================================================================
//
// ¿Qué es esto?
//   Es el único archivo que sabe DÓNDE y CÓMO se guardan las asignaturas.
//   Aquí "guardar" significa tenerlas en un array de JavaScript. Al parar el
//   servidor (Ctrl+C) se pierden los cambios y al arrancar vuelven los datos
//   iniciales de abajo. La práctica lo pide así (sin base de datos).
//
// ¿Por qué un archivo aparte?
//   El controlador (que responde a las peticiones) nunca toca el array: solo
//   llama a las funciones de este archivo (findAll, create...). Si un día se
//   cambia el array por una base de datos, solo hay que reescribir ESTE
//   archivo y el resto del proyecto no se entera.
//
// ¿Qué NO hace?
//   No valida (eso es del validador) ni decide códigos HTTP como 404 (eso es
//   del controlador). Aquí solo se guardan, buscan y borran datos. Por eso
//   findById devuelve undefined si no existe, en vez de un error.

// ---------------------------------------------------------------------
// 1. Datos iniciales (semilla)
// ---------------------------------------------------------------------
// Son las asignaturas de plan-estudios.html. Campos de cada una:
//   nombre      texto
//   creditos    ECTS (entero 1-12). 6 es PROVISIONAL: cámbialo si conoces el real.
//   curso       1 a 5
//   obligatoria true / false
//   area        programacion | matematicas | datos-ia | sistemas | etica
// El id NO está aquí: se asigna al cargar (ver cargarSemilla).
const semilla = [
  // Primer curso
  { nombre: 'Fundamentos de Programación', creditos: 6, curso: 1, obligatoria: true, area: 'programacion' },
  { nombre: 'Álgebra', creditos: 6, curso: 1, obligatoria: true, area: 'matematicas' },
  { nombre: 'Cálculo', creditos: 6, curso: 1, obligatoria: true, area: 'matematicas' },
  { nombre: 'Probabilidad y Estadística', creditos: 6, curso: 1, obligatoria: true, area: 'matematicas' },
  // Segundo curso
  { nombre: 'Estructuras de Datos y Algoritmos', creditos: 6, curso: 2, obligatoria: true, area: 'programacion' },
  { nombre: 'Bases de Datos', creditos: 6, curso: 2, obligatoria: true, area: 'datos-ia' },
  { nombre: 'Programación de Aplicaciones Web', creditos: 6, curso: 2, obligatoria: true, area: 'programacion' },
  // Tercer curso
  { nombre: 'Matemática Discreta', creditos: 6, curso: 3, obligatoria: true, area: 'matematicas' },
  { nombre: 'Desarrollo de la IA e Inteligencia Natural', creditos: 6, curso: 3, obligatoria: true, area: 'datos-ia' },
  { nombre: 'Redes y Sistemas Operativos', creditos: 6, curso: 3, obligatoria: true, area: 'sistemas' },
  { nombre: 'Computación en la Nube', creditos: 6, curso: 3, obligatoria: true, area: 'sistemas' },
  // Cuarto curso
  { nombre: 'Lógica Basada en Datos', creditos: 6, curso: 4, obligatoria: true, area: 'datos-ia' },
  { nombre: 'Ciberseguridad', creditos: 6, curso: 4, obligatoria: true, area: 'sistemas' },
  { nombre: 'Procesamiento del Lenguaje Natural', creditos: 6, curso: 4, obligatoria: true, area: 'datos-ia' },
  { nombre: 'Visualización de Datos', creditos: 6, curso: 4, obligatoria: true, area: 'datos-ia' },
  // Quinto curso
  { nombre: 'Ética y Regulación de la Inteligencia Artificial', creditos: 6, curso: 5, obligatoria: true, area: 'etica' },
  { nombre: 'IoT', creditos: 6, curso: 5, obligatoria: true, area: 'sistemas' },
  { nombre: 'Prácticas externas', creditos: 12, curso: 5, obligatoria: true, area: 'datos-ia' },
  { nombre: 'Trabajo Fin de Grado', creditos: 12, curso: 5, obligatoria: true, area: 'datos-ia' },
];

// ---------------------------------------------------------------------
// 2. Estado (las variables que cambian mientras el servidor está en marcha)
// ---------------------------------------------------------------------
let asignaturas = []; // la "tabla" con todas las asignaturas
let siguienteId = 1; // el id que recibirá la próxima asignatura creada

// Rellena el array con la semilla y numera: 1, 2, 3...
// Se usa al arrancar y en reset().
function cargarSemilla() {
  asignaturas = semilla.map((a, i) => ({ id: i + 1, ...a }));
  siguienteId = asignaturas.length + 1;
}

cargarSemilla();

// ---------------------------------------------------------------------
// 3. Utilidades internas (no se exportan)
// ---------------------------------------------------------------------

// Devuelve una COPIA del objeto. Así, quien reciba una asignatura no puede
// modificar el array original sin pasar por update() o replace().
function copia(a) {
  return a ? { ...a } : undefined;
}

// Posición de un id en el array, o -1 si no existe.
function buscarPosicion(id) {
  return asignaturas.findIndex((a) => a.id === id);
}

// ---------------------------------------------------------------------
// 4. Operaciones (lo que usa el controlador)
// ---------------------------------------------------------------------

// Todas las asignaturas (copias). El filtrado, el orden y la paginación
// los hace el controlador sobre esta lista.
function findAll() {
  return asignaturas.map(copia);
}

// Una asignatura por id, o undefined si no existe.
function findById(id) {
  return copia(asignaturas[buscarPosicion(id)]);
}

// Crea una asignatura nueva. Los datos ya vienen validados y sin "id":
// el id lo pone el servidor, y NUNCA se reutiliza aunque se borre una.
function create(datos) {
  const nueva = { id: siguienteId++, ...datos };
  asignaturas.push(nueva);
  return copia(nueva);
}

// PUT: sustituye TODOS los campos (menos el id). undefined si no existe.
function replace(id, datos) {
  const i = buscarPosicion(id);
  if (i === -1) return undefined;
  asignaturas[i] = { id, ...datos };
  return copia(asignaturas[i]);
}

// PATCH: cambia SOLO los campos recibidos y deja los demás como estaban.
// "id" va al final para que nadie pueda cambiarlo por esta vía.
function update(id, cambios) {
  const i = buscarPosicion(id);
  if (i === -1) return undefined;
  asignaturas[i] = { ...asignaturas[i], ...cambios, id };
  return copia(asignaturas[i]);
}

// Borra una asignatura. Devuelve true si existía y false si no.
function remove(id) {
  const i = buscarPosicion(id);
  if (i === -1) return false;
  asignaturas.splice(i, 1);
  return true;
}

// Deja los datos como al arrancar. Sirve para las pruebas automáticas.
function reset() {
  cargarSemilla();
}

module.exports = { findAll, findById, create, replace, update, remove, reset };
