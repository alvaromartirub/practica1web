// Calculadora de nota media por curso.
//
// Lee las asignaturas del curso elegido desde la API (GET /asignaturas?curso=N)
// y calcula la media ponderada por créditos ECTS. Las notas solo viven en los
// campos de la página: no se envían al servidor ni se guardan.

const selectorCurso = document.querySelector('#curso');
const listaNotas = document.querySelector('#asignaturas');
const cargando = document.querySelector('#cargando');
const bloqueError = document.querySelector('#bloque-error');
const mensajeError = document.querySelector('#mensaje-error');
const vacio = document.querySelector('#vacio');
const botonLimpiar = document.querySelector('#limpiar');

const caja = document.querySelector('#resultado');
const valorMedia = document.querySelector('#media');
const detalle = document.querySelector('#detalle');

let peticionActual = 0; // para ignorar respuestas antiguas si se cambia de curso rápido

// ---------- Carga de asignaturas ----------

function mostrarEstado(estado) {
  cargando.hidden = estado !== 'cargando';
  bloqueError.hidden = estado !== 'error';
  vacio.hidden = estado !== 'vacio';
  listaNotas.hidden = estado !== 'lista';
  botonLimpiar.hidden = estado !== 'lista';
}

async function cargarCurso() {
  const curso = selectorCurso.value;
  listaNotas.replaceChildren();
  actualizarMedia();

  if (!curso) {
    mostrarEstado('ninguno');
    return;
  }

  const miPeticion = ++peticionActual;
  mostrarEstado('cargando');

  try {
    const params = new URLSearchParams({ curso, sort: 'nombre', order: 'asc', limit: '100' });
    const respuesta = await fetch(`/asignaturas?${params}`);
    if (!respuesta.ok) {
      throw new Error(`El servidor respondió con el error ${respuesta.status}`);
    }
    const asignaturas = await respuesta.json();
    if (miPeticion !== peticionActual) return;

    if (asignaturas.length === 0) {
      mostrarEstado('vacio');
      return;
    }
    asignaturas.forEach((a) => listaNotas.append(crearFila(a)));
    mostrarEstado('lista');
    actualizarMedia();
  } catch (e) {
    if (miPeticion !== peticionActual) return;
    const sinConexion = e instanceof TypeError; // fetch lanza TypeError si no hay red
    mensajeError.textContent = sinConexion
      ? 'No se pudo conectar con el servidor. Comprueba que está en marcha.'
      : e.message;
    mostrarEstado('error');
  }
}

function crearFila(a) {
  const li = document.createElement('li');
  li.className = 'nota';
  li.dataset.creditos = String(a.creditos);

  const etiqueta = document.createElement('label');
  etiqueta.className = 'nota__nombre';
  etiqueta.htmlFor = `nota-${a.id}`;
  etiqueta.textContent = a.nombre;

  const ects = document.createElement('span');
  ects.className = 'nota__ects';
  ects.textContent = `${a.creditos} ECTS · ${a.obligatoria ? 'Obligatoria' : 'Optativa'}`;
  etiqueta.append(ects);

  const campo = document.createElement('input');
  campo.type = 'number';
  campo.id = `nota-${a.id}`;
  campo.min = '0';
  campo.max = '10';
  campo.step = '0.01';
  campo.inputMode = 'decimal';
  campo.placeholder = '0–10';
  campo.setAttribute('aria-describedby', `error-nota-${a.id}`);

  const error = document.createElement('p');
  error.className = 'nota__error';
  error.id = `error-nota-${a.id}`;

  li.append(etiqueta, campo, error);
  return li;
}

// ---------- Cálculo ----------

// Devuelve la nota como número, o null si el campo está vacío o no es válido.
// Si no es válido, además marca el campo con su mensaje.
function leerNota(fila) {
  const campo = fila.querySelector('input');
  const error = fila.querySelector('.nota__error');
  const texto = campo.value.trim();

  campo.removeAttribute('aria-invalid');
  error.textContent = '';

  if (texto === '') return null;

  const nota = Number(texto);
  if (Number.isNaN(nota) || nota < 0 || nota > 10) {
    campo.setAttribute('aria-invalid', 'true');
    error.textContent = 'La nota debe estar entre 0 y 10. No se cuenta en la media.';
    return null;
  }
  return nota;
}

function calificacion(media) {
  if (media < 5) return { texto: 'Suspenso', clase: 'resultado--suspenso' };
  if (media < 7) return { texto: 'Aprobado', clase: 'resultado--aprobado' };
  if (media < 9) return { texto: 'Notable', clase: 'resultado--notable' };
  return { texto: 'Sobresaliente', clase: 'resultado--sobresaliente' };
}

// Media ponderada: suma(nota × créditos) / suma(créditos), solo de las asignaturas con nota.
function actualizarMedia() {
  const filas = listaNotas.querySelectorAll('.nota');
  let puntos = 0;
  let creditosConNota = 0;
  let conNota = 0;
  let creditosTotales = 0;

  for (const fila of filas) {
    const creditos = Number(fila.dataset.creditos);
    creditosTotales += creditos;
    const nota = leerNota(fila);
    if (nota !== null) {
      puntos += nota * creditos;
      creditosConNota += creditos;
      conNota++;
    }
  }

  caja.classList.remove('resultado--suspenso', 'resultado--aprobado', 'resultado--notable', 'resultado--sobresaliente');

  if (filas.length === 0) {
    valorMedia.textContent = '–';
    detalle.textContent = 'Elige un curso y escribe alguna nota.';
    return;
  }
  if (conNota === 0) {
    valorMedia.textContent = '–';
    detalle.textContent = 'Escribe la nota de alguna asignatura para ver la media.';
    return;
  }

  const media = puntos / creditosConNota;
  const nivel = calificacion(media);
  valorMedia.textContent = media.toFixed(2).replace('.', ',');
  caja.classList.add(nivel.clase);
  detalle.textContent =
    `${nivel.texto} · ${conNota} de ${filas.length} asignaturas · ${creditosConNota} de ${creditosTotales} ECTS`;
}

// ---------- Eventos ----------

selectorCurso.addEventListener('change', cargarCurso);

// Un solo listener para todos los campos de nota (delegación de eventos).
listaNotas.addEventListener('input', actualizarMedia);

botonLimpiar.addEventListener('click', () => {
  listaNotas.querySelectorAll('input').forEach((campo) => {
    campo.value = '';
  });
  actualizarMedia();
  const primero = listaNotas.querySelector('input');
  if (primero) primero.focus();
});

document.querySelector('#reintentar').addEventListener('click', cargarCurso);
