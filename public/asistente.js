// Asistente del grado: panel de preguntas ya escritas, sin base de datos ni servicios externos.
//
// Cómo funciona:
//   1. Se muestran las categorías (Grado, Plan de estudios, Cursos...), que salen de
//      CATEGORIAS en asistente-datos.js.
//   2. Al pulsar una categoría se muestran sus preguntas.
//   3. Al pulsar una pregunta se escribe en el chat y el asistente contesta:
//        - si la pregunta tiene una respuesta fija, la muestra;
//        - si tiene "api", pide los datos al servidor con fetch y los muestra.
//
// La conversación solo existe en la página: no se guarda en ningún sitio.

const mensajes = document.querySelector('#mensajes');
const contenedorCategorias = document.querySelector('#categorias');
const contenedorPreguntas = document.querySelector('#preguntas');
const botonBorrar = document.querySelector('#borrar');

const NOMBRES_AREA = {
  programacion: 'Programación',
  matematicas: 'Matemáticas',
  'datos-ia': 'Datos e IA',
  sistemas: 'Sistemas',
  etica: 'Ética',
};

const SIN_API = {
  texto: 'Ahora mismo no puedo consultar las asignaturas porque el servidor no responde. Puedes verlas en el plan de estudios.',
  enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
};

// ---------- Burbujas del chat ----------

function crearBurbuja(clase) {
  const div = document.createElement('div');
  div.className = 'mensaje ' + clase;
  mensajes.appendChild(div);
  return div;
}

function bajar() {
  mensajes.scrollTop = mensajes.scrollHeight;
}

function mostrarUsuario(texto) {
  const div = crearBurbuja('mensaje--usuario');
  div.textContent = texto; // textContent: nunca se interpreta como HTML
  bajar();
}

// respuesta = { texto, lista?, enlace? }
function mostrarAsistente(respuesta) {
  const div = crearBurbuja('mensaje--asistente');

  const p = document.createElement('p');
  p.textContent = respuesta.texto;
  div.appendChild(p);

  if (respuesta.lista && respuesta.lista.length > 0) {
    const ul = document.createElement('ul');
    for (const elemento of respuesta.lista) {
      const li = document.createElement('li');
      li.textContent = elemento;
      ul.appendChild(li);
    }
    div.appendChild(ul);
  }

  if (respuesta.enlace) {
    const pie = document.createElement('p');
    pie.className = 'mensaje__fuente';
    pie.append('Más información: ');
    const a = document.createElement('a');
    a.href = respuesta.enlace.url;
    a.textContent = respuesta.enlace.texto;
    pie.appendChild(a);
    div.appendChild(pie);
  }
  bajar();
}

// ---------- Respuestas que vienen de la API ----------

// Una línea por asignatura: "Álgebra · 1.º curso · 6 ECTS · Obligatoria"
// La lista de reserva no tiene créditos, así que solo se añaden si existen.
function lineaAsignatura(a) {
  let linea = a.nombre + ' · ' + a.curso + '.º curso';
  if (a.creditos !== undefined) linea += ' · ' + a.creditos + ' ECTS';
  linea += ' · ' + (a.obligatoria ? 'Obligatoria' : 'Optativa');
  return linea;
}

async function responderConApi(pregunta) {
  const api = pregunta.api;
  let respuesta;

  try {
    const response = await fetch(api.url);
    // fetch NO falla con un 404 o un 500: hay que comprobar response.ok.
    if (!response.ok) throw new Error('estado ' + response.status);
    const datos = await response.json();

    if (api.tipo === 'lista') {
      respuesta = {
        texto: datos.length === 0 ? 'No hay asignaturas que cumplan esa consulta.' : api.intro + ' (' + datos.length + '):',
        lista: datos.map(lineaAsignatura),
      };
    } else if (api.tipo === 'resumen') {
      respuesta = {
        texto: api.intro + ':',
        lista: [
          'Asignaturas: ' + datos.total,
          'Obligatorias: ' + datos.obligatorias,
          'Optativas: ' + datos.optativas,
          'Créditos totales: ' + datos.creditosTotales + ' ECTS',
        ],
      };
    } else {
      // tipo 'areas': datos.porArea es un objeto { area: cantidad }
      const lista = [];
      for (const area of Object.keys(datos.porArea)) {
        lista.push(NOMBRES_AREA[area] + ': ' + datos.porArea[area]);
      }
      respuesta = { texto: api.intro + ':', lista };
    }
  } catch (error) {
    // Sin API: si la pregunta tiene lista de reserva, se usa; si no, se avisa.
    if (api.tipo === 'lista' && api.respaldo) {
      const lista = PLAN_RESPALDO.filter(api.respaldo).map(lineaAsignatura);
      respuesta = { texto: api.intro + ' (' + lista.length + ', sin datos del servidor):', lista };
    } else {
      respuesta = SIN_API;
    }
  }

  respuesta.enlace = pregunta.enlace;
  mostrarAsistente(respuesta);
}

// ---------- Panel de categorías y preguntas ----------

function elegirPregunta(pregunta) {
  mostrarUsuario(pregunta.texto);
  if (pregunta.api) {
    responderConApi(pregunta);
  } else {
    // La pregunta guarda su respuesta en .respuesta (y .texto es la pregunta).
    mostrarAsistente({ texto: pregunta.respuesta, lista: pregunta.lista, enlace: pregunta.enlace });
  }
}

function mostrarPreguntas(categoria) {
  contenedorPreguntas.textContent = '';
  for (const pregunta of categoria.preguntas) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'sugerencia';
    boton.textContent = pregunta.texto;
    boton.addEventListener('click', () => elegirPregunta(pregunta));
    contenedorPreguntas.appendChild(boton);
  }
}

function elegirCategoria(categoria) {
  // aria-pressed marca visualmente (y para lectores de pantalla) la categoría activa.
  for (const boton of contenedorCategorias.querySelectorAll('button')) {
    boton.setAttribute('aria-pressed', boton.textContent === categoria.nombre ? 'true' : 'false');
  }
  mostrarPreguntas(categoria);
}

function crearCategorias() {
  for (const categoria of CATEGORIAS) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'categoria';
    boton.textContent = categoria.nombre;
    boton.addEventListener('click', () => elegirCategoria(categoria));
    contenedorCategorias.appendChild(boton);
  }
}

function saludar() {
  mostrarAsistente({
    texto: 'Hola, soy el asistente del Grado en Ciencia de Datos e Inteligencia Artificial. Elige una categoría y pulsa la pregunta que quieras.',
  });
}

botonBorrar.addEventListener('click', () => {
  mensajes.textContent = '';
  saludar();
});

// ---------- Arranque ----------
crearCategorias();
elegirCategoria(CATEGORIAS[0]);
saludar();
