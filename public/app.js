// Cliente de la aplicación de asignaturas.
// Habla con la API REST (/asignaturas) usando fetch. El buscador, los filtros y
// la ordenación los hace el SERVIDOR: aquí solo se construye la consulta
// (?search=...&area=...) y se pinta el resultado.

const API = '/asignaturas';

const NOMBRES_AREA = {
  programacion: 'Programación',
  matematicas: 'Matemáticas',
  'datos-ia': 'Datos e IA',
  sistemas: 'Sistemas',
  etica: 'Ética',
};

// ---------- Referencias al DOM ----------
const form = document.querySelector('#form-asignatura');
const tituloFormulario = document.querySelector('#titulo-formulario');
const botonCancelar = document.querySelector('#boton-cancelar');
const errorGeneral = document.querySelector('#error-general');

const buscar = document.querySelector('#buscar');
const filtroArea = document.querySelector('#filtro-area');
const filtroTipo = document.querySelector('#filtro-tipo');
const filtroCurso = document.querySelector('#filtro-curso');
const ordenCampo = document.querySelector('#orden-campo');
const ordenSentido = document.querySelector('#orden-sentido');
const botonLimpiar = document.querySelector('#limpiar');

const contador = document.querySelector('#contador');
const cargando = document.querySelector('#cargando');
const mensajeError = document.querySelector('#mensaje-error');
const vacio = document.querySelector('#vacio');
const tabla = document.querySelector('#tabla');
const lista = document.querySelector('#lista');
const aviso = document.querySelector('#aviso');

// ---------- Estado ----------
let editandoId = null; // id de la asignatura que se está editando (null = creando)
let asignaturas = []; // las asignaturas que se están mostrando
let idPorConfirmar = null; // id de la fila que está pidiendo confirmar el borrado

// ---------- Cargar y pintar el listado ----------

// Construye la parte "?search=...&area=..." con los controles que tengan valor.
function construirConsulta() {
  let consulta = '';
  const parametros = [
    ['search', buscar.value.trim()],
    ['area', filtroArea.value],
    ['obligatoria', filtroTipo.value],
    ['curso', filtroCurso.value],
    ['sort', ordenCampo.value],
    ['order', ordenSentido.value],
  ];
  for (const [nombre, valor] of parametros) {
    if (valor !== '') {
      consulta += (consulta === '' ? '?' : '&') + nombre + '=' + valor;
    }
  }
  return consulta;
}

async function cargarLista() {
  idPorConfirmar = null;
  // Estado "cargando": se ve el indicador y se oculta el resto.
  cargando.hidden = false;
  mensajeError.hidden = true;
  vacio.hidden = true;
  tabla.hidden = true;
  contador.textContent = '';

  try {
    const response = await fetch(API + construirConsulta());
    // fetch NO falla con un 400 o un 500: hay que comprobar response.ok.
    if (!response.ok) {
      throw new Error('El servidor respondió con el estado ' + response.status);
    }
    asignaturas = await response.json();
    pintarLista();
  } catch (error) {
    mensajeError.textContent = 'No se pudo cargar el listado. ' + error.message;
    mensajeError.hidden = false;
  } finally {
    cargando.hidden = true;
  }
}

// Crea un botón de la tabla. La acción y el id van en data-accion y data-id.
function crearBoton(texto, clase, accion, id) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = texto;
  boton.className = clase;
  boton.dataset.accion = accion;
  boton.dataset.id = id;
  return boton;
}

function pintarLista() {
  lista.textContent = '';
  contador.textContent = asignaturas.length + ' resultados';

  // Estado "lista vacía".
  if (asignaturas.length === 0) {
    vacio.hidden = false;
    return;
  }

  for (const asignatura of asignaturas) {
    const fila = document.createElement('tr');

    // Cada dato va en su celda. Se usa textContent (nunca innerHTML) para que
    // lo que escriba el usuario no se interprete como HTML.
    const datos = [
      asignatura.nombre,
      asignatura.curso + '.º',
      asignatura.creditos,
      NOMBRES_AREA[asignatura.area],
      asignatura.obligatoria ? 'Obligatoria' : 'Optativa',
    ];
    for (const dato of datos) {
      const celda = document.createElement('td');
      celda.textContent = dato;
      fila.appendChild(celda);
    }

    // Celda de acciones. Normalmente: Editar y Eliminar. Si se ha pulsado
    // Eliminar en esta fila, se pide confirmar: Confirmar y Cancelar.
    const acciones = document.createElement('td');
    if (asignatura.id === idPorConfirmar) {
      acciones.appendChild(crearBoton('Confirmar borrado', 'peligro', 'confirmar', asignatura.id));
      acciones.appendChild(crearBoton('Cancelar', 'secundario', 'cancelar', asignatura.id));
    } else {
      acciones.appendChild(crearBoton('Editar', 'secundario', 'editar', asignatura.id));
      acciones.appendChild(crearBoton('Eliminar', 'peligro', 'eliminar', asignatura.id));
    }
    fila.appendChild(acciones);

    lista.appendChild(fila);
  }
  tabla.hidden = false;
}

// ---------- Resumen (GET /asignaturas/stats) ----------
async function cargarResumen() {
  const errorResumen = document.querySelector('#resumen-error');
  try {
    const response = await fetch(API + '/stats');
    if (!response.ok) throw new Error('estado ' + response.status);
    const datos = await response.json();
    document.querySelector('#est-total').textContent = datos.total;
    document.querySelector('#est-obligatorias').textContent = datos.obligatorias;
    document.querySelector('#est-optativas').textContent = datos.optativas;
    document.querySelector('#est-creditos').textContent = datos.creditosTotales;
    document.querySelector('#resumen-datos').hidden = false;
    errorResumen.hidden = true;
  } catch (error) {
    errorResumen.textContent = 'No se pudo cargar el resumen (' + error.message + ').';
    errorResumen.hidden = false;
  }
}

// ---------- Formulario: validación en cliente ----------

// Primera comprobación rápida, para no molestar al servidor con datos evidentes.
// La validación que manda es la del servidor (el cliente puede saltarse).
function validarFormulario() {
  const errores = {};
  const nombre = form.nombre.value.trim();
  const creditos = Number(form.creditos.value);
  const curso = Number(form.curso.value);

  if (nombre.length < 3 || nombre.length > 80) errores.nombre = 'El nombre debe tener entre 3 y 80 caracteres';
  if (!Number.isInteger(creditos) || creditos < 1 || creditos > 12) errores.creditos = 'Los créditos deben ser un entero entre 1 y 12';
  if (!Number.isInteger(curso) || curso < 1 || curso > 5) errores.curso = 'El curso debe ser un entero entre 1 y 5';
  if (form.area.value === '') errores.area = 'Elige un área';
  return errores;
}

// Escribe cada mensaje junto a su campo (<span data-campo="nombre">...).
function mostrarErrores(errores) {
  for (const span of form.querySelectorAll('.error[data-campo]')) {
    span.textContent = errores[span.dataset.campo] || '';
  }
  errorGeneral.textContent = errores.general || '';
  errorGeneral.hidden = !errores.general;
}

function leerFormulario() {
  return {
    nombre: form.nombre.value.trim(),
    creditos: Number(form.creditos.value),
    curso: Number(form.curso.value),
    area: form.area.value,
    obligatoria: form.obligatoria.checked,
  };
}

// ---------- Crear y editar ----------
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // evita que el navegador recargue la página

  const erroresCliente = validarFormulario();
  mostrarErrores(erroresCliente);
  if (Object.keys(erroresCliente).length > 0) return;

  // Crear = POST /asignaturas. Editar = PUT /asignaturas/:id (sustituye todo).
  const editando = editandoId !== null;
  const url = editando ? API + '/' + editandoId : API;
  const metodo = editando ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leerFormulario()),
    });

    if (response.status === 400) {
      // El servidor devuelve { errors: [{ field, message }] }: uno por campo.
      const datos = await response.json();
      const errores = {};
      for (const e of datos.errors) errores[e.field] = e.message;
      mostrarErrores(errores);
      return;
    }
    if (!response.ok) throw new Error('estado ' + response.status);

    mostrarAviso(editando ? 'Asignatura actualizada' : 'Asignatura creada');
    salirDeEdicion();
    cargarLista();
    cargarResumen();
  } catch (error) {
    mostrarErrores({ general: 'No se pudo guardar: ' + error.message });
  }
});

function empezarEdicion(asignatura) {
  editandoId = asignatura.id;
  form.nombre.value = asignatura.nombre;
  form.creditos.value = asignatura.creditos;
  form.curso.value = asignatura.curso;
  form.area.value = asignatura.area;
  form.obligatoria.checked = asignatura.obligatoria;
  tituloFormulario.textContent = 'Editar asignatura';
  botonCancelar.hidden = false;
  mostrarErrores({});
  form.nombre.focus();
}

function salirDeEdicion() {
  editandoId = null;
  // Se vacía cada campo a mano.
  form.nombre.value = '';
  form.creditos.value = '';
  form.curso.value = '';
  form.area.value = '';
  form.obligatoria.checked = false;
  tituloFormulario.textContent = 'Nueva asignatura';
  botonCancelar.hidden = true;
  mostrarErrores({});
}

botonCancelar.addEventListener('click', salirDeEdicion);

// ---------- Editar y eliminar (un solo listener para toda la tabla) ----------
lista.addEventListener('click', async (event) => {
  const boton = event.target.closest('button');
  if (!boton) return;
  const id = Number(boton.dataset.id);
  const asignatura = asignaturas.find((a) => a.id === id);

  if (boton.dataset.accion === 'editar') {
    empezarEdicion(asignatura);
  }

  // Primer clic en Eliminar: la fila pide confirmación (se vuelve a pintar).
  if (boton.dataset.accion === 'eliminar') {
    idPorConfirmar = id;
    pintarLista();
  }

  if (boton.dataset.accion === 'cancelar') {
    idPorConfirmar = null;
    pintarLista();
  }

  // Segundo clic (Confirmar borrado): ahora sí se borra en el servidor.
  if (boton.dataset.accion === 'confirmar') {
    idPorConfirmar = null;
    try {
      const response = await fetch(API + '/' + id, { method: 'DELETE' });
      if (!response.ok) throw new Error('estado ' + response.status);
      if (editandoId === id) salirDeEdicion();
      mostrarAviso('Asignatura eliminada');
      cargarLista();
      cargarResumen();
    } catch (error) {
      mostrarAviso('No se pudo eliminar: ' + error.message);
      pintarLista();
    }
  }
});

// ---------- Mensaje de aviso ----------
// Se queda visible hasta la siguiente acción (sin temporizadores).
function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.hidden = false;
}

// ---------- Buscador y filtros ----------
// Cada cambio vuelve a pedir el listado al servidor con la nueva consulta.
buscar.addEventListener('input', cargarLista);
filtroArea.addEventListener('change', cargarLista);
filtroTipo.addEventListener('change', cargarLista);
filtroCurso.addEventListener('change', cargarLista);
ordenCampo.addEventListener('change', cargarLista);
ordenSentido.addEventListener('change', cargarLista);

botonLimpiar.addEventListener('click', () => {
  buscar.value = '';
  filtroArea.value = '';
  filtroTipo.value = '';
  filtroCurso.value = '';
  ordenCampo.value = 'nombre';
  ordenSentido.value = 'asc';
  cargarLista();
});

// ---------- Arranque ----------
cargarLista();
cargarResumen();
