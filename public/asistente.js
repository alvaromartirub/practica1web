// Asistente del grado: chatbot por reglas, sin base de datos ni servicios externos.
//
// Cómo decide qué responder (por orden):
//   1. Saludo, agradecimiento o petición de ayuda.
//   2. Una asignatura concreta ("háblame de Álgebra")  -> datos de la API.
//   3. Un curso ("asignaturas de 2.º")                 -> lista desde la API.
//   4. Un área, optativas o "cuántas asignaturas"      -> datos de la API.
//   5. La base de conocimiento (asistente-datos.js)    -> la entrada con más palabras clave.
//   6. Si nada encaja: lo dice y propone preguntas.
//
// La conversación solo existe en la página: no se guarda en ningún sitio.

const mensajes = document.querySelector('#mensajes');
const form = document.querySelector('#form-chat');
const campo = document.querySelector('#pregunta');
const contenedorSugerencias = document.querySelector('#sugerencias');

const SUGERENCIAS = [
  '¿Cómo es el proceso de admisión?',
  '¿Qué documentos necesito?',
  'Asignaturas de 2.º curso',
  '¿Qué salidas profesionales hay?',
  '¿Qué es un Minor?',
  '¿Cuántas asignaturas hay?',
  'Háblame de Álgebra',
];

const NOMBRES_AREA = {
  programacion: 'Programación',
  matematicas: 'Matemáticas',
  'datos-ia': 'Datos e IA',
  sistemas: 'Sistemas',
  etica: 'Ética',
};

const ORDINALES = { primer: 1, primero: 1, primera: 1, segundo: 2, tercer: 3, tercero: 3, cuarto: 4, quinto: 5 };
const PALABRAS_VACIAS = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'en', 'a', 'para', 'con', 'una', 'un'];

let asignaturas = null; // se carga una vez desde la API; null si no se ha podido

// ---------- Utilidades ----------

// Minúsculas, sin tildes y sin signos: "¿Qué es el 2.º curso?" -> "que es el 2 curso"
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ¿Aparece la palabra clave al principio de alguna palabra del texto?
function contiene(textoNormalizado, clave) {
  return new RegExp(`(^| )${normalizar(clave)}`).test(textoNormalizado);
}

// ---------- Interfaz del chat ----------

function burbuja(clase) {
  const div = document.createElement('div');
  div.className = `mensaje ${clase}`;
  mensajes.append(div);
  return div;
}

function bajar() {
  mensajes.scrollTop = mensajes.scrollHeight;
}

function mostrarUsuario(texto) {
  const div = burbuja('mensaje--usuario');
  div.textContent = texto; // textContent: lo escrito nunca se interpreta como HTML
  bajar();
}

// respuesta = { texto, lista?, enlace? }
function mostrarAsistente(respuesta) {
  const div = burbuja('mensaje--asistente');

  const p = document.createElement('p');
  p.textContent = respuesta.texto;
  div.append(p);

  if (respuesta.lista && respuesta.lista.length > 0) {
    const ul = document.createElement('ul');
    for (const elemento of respuesta.lista) {
      const li = document.createElement('li');
      li.textContent = elemento;
      ul.append(li);
    }
    div.append(ul);
  }

  if (respuesta.enlace) {
    const pie = document.createElement('p');
    pie.className = 'mensaje__fuente';
    pie.append('Más información: ');
    const a = document.createElement('a');
    a.href = respuesta.enlace.url;
    a.textContent = respuesta.enlace.texto;
    pie.append(a);
    div.append(pie);
  }
  bajar();
}

// Pequeña pausa con "escribiendo…" para que la conversación se sienta natural.
function responderConRetraso(respuesta) {
  const espera = burbuja('mensaje--asistente mensaje--espera');
  espera.textContent = 'Escribiendo…';
  bajar();
  setTimeout(() => {
    espera.remove();
    mostrarAsistente(respuesta);
  }, 350);
}

// ---------- Datos de la API ----------

async function cargarAsignaturas() {
  try {
    const respuesta = await fetch('/asignaturas?limit=100&sort=curso&order=asc');
    if (!respuesta.ok) throw new Error(String(respuesta.status));
    asignaturas = await respuesta.json();
  } catch (e) {
    asignaturas = null; // el asistente seguirá respondiendo con la base de conocimiento
  }
}

const SIN_API = {
  texto: 'Ahora mismo no puedo consultar las asignaturas porque el servidor no responde. Puedes verlas en el plan de estudios.',
  enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
};

function describir(a) {
  return `${a.nombre} — ${a.curso}.º curso, ${a.creditos} ECTS, ${a.obligatoria ? 'obligatoria' : 'optativa'}`;
}

// ---------- Reglas que usan la API ----------

// Busca si el mensaje habla de una asignatura concreta: compara las palabras de su nombre.
function buscarAsignatura(texto) {
  const palabrasTexto = texto.split(' ');
  let mejor = null;
  let mejorPuntuacion = 0;

  for (const a of asignaturas) {
    const palabras = normalizar(a.nombre).split(' ').filter((p) => !PALABRAS_VACIAS.includes(p));
    const aciertos = palabras.filter((p) => palabrasTexto.includes(p)).length;
    const puntuacion = aciertos / palabras.length;
    if (puntuacion >= 0.6 && puntuacion > mejorPuntuacion) {
      mejor = a;
      mejorPuntuacion = puntuacion;
    }
  }
  return mejor;
}

function detectarCurso(texto) {
  if (!/(curso|asignatura|materia|ano)/.test(texto)) return null;
  for (const [palabra, numero] of Object.entries(ORDINALES)) {
    if (contiene(texto, palabra)) return numero;
  }
  const m = texto.match(/(^| )(?:curso )?([1-5])( |$)/);
  return m ? Number(m[2]) : null;
}

function reglasConApi(texto) {
  const asignatura = buscarAsignatura(texto);
  if (asignatura) {
    return {
      texto: `${describir(asignatura)}, área ${NOMBRES_AREA[asignatura.area] || asignatura.area}.`,
      enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
    };
  }

  const curso = detectarCurso(texto);
  if (curso) {
    const delCurso = asignaturas.filter((a) => a.curso === curso);
    return {
      texto: delCurso.length > 0 ? `Asignaturas de ${curso}.º curso (${delCurso.length}):` : `No tengo asignaturas registradas en ${curso}.º curso.`,
      lista: delCurso.map((a) => `${a.nombre} (${a.creditos} ECTS${a.obligatoria ? '' : ', optativa'})`),
      enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
    };
  }

  if (/cuantas (asignaturas|materias)/.test(texto)) {
    const obligatorias = asignaturas.filter((a) => a.obligatoria).length;
    return {
      texto: `La aplicación tiene ${asignaturas.length} asignaturas: ${obligatorias} obligatorias y ${asignaturas.length - obligatorias} optativas.`,
      enlace: { texto: 'Listado de asignaturas', url: 'index.html' },
    };
  }

  if (/optativ/.test(texto)) {
    const optativas = asignaturas.filter((a) => !a.obligatoria);
    return {
      texto: `Asignaturas optativas (${optativas.length}):`,
      lista: optativas.map(describir),
      enlace: { texto: 'Minor opcional', url: 'plan-estudios.html#minor' },
    };
  }

  for (const [area, nombre] of Object.entries(NOMBRES_AREA)) {
    if (/asignatura|materia/.test(texto) && contiene(texto, normalizar(nombre))) {
      const delArea = asignaturas.filter((a) => a.area === area);
      return {
        texto: `Asignaturas del área de ${nombre} (${delArea.length}):`,
        lista: delArea.map(describir),
        enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
      };
    }
  }
  return null;
}

// ---------- Base de conocimiento ----------

function buscarEnBase(texto) {
  let mejor = null;
  let mejorPuntuacion = 0;
  for (const entrada of BASE_CONOCIMIENTO) {
    const aciertos = entrada.palabras.filter((p) => contiene(texto, p)).length;
    const puntuacion = aciertos * (entrada.peso || 1);
    if (puntuacion > mejorPuntuacion) {
      mejor = entrada;
      mejorPuntuacion = puntuacion;
    }
  }
  return mejor;
}

// ---------- Decisión ----------

function responder(pregunta) {
  const texto = normalizar(pregunta);

  if (texto === '') {
    return { texto: 'Escribe una pregunta, por ejemplo: «¿Qué documentos necesito para la admisión?».' };
  }
  if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)( |$)/.test(texto)) {
    return { texto: '¡Hola! Soy el asistente del grado. Pregúntame por la admisión, el plan de estudios, una asignatura o las salidas profesionales.' };
  }
  if (/(gracias|genial|perfecto|vale gracias)/.test(texto)) {
    return { texto: '¡De nada! Si tienes otra duda, aquí estoy.' };
  }
  if (/(ayuda|que puedes|que sabes|que haces|como funciona)/.test(texto)) {
    return {
      texto: 'Puedo responder sobre:',
      lista: ['El grado y sus datos (duración, créditos, centro)', 'El proceso de admisión y la documentación', 'Las asignaturas de cada curso o de una en concreto', 'Los Minors', 'Las salidas profesionales', 'Las noticias'],
    };
  }

  // Preguntas sobre asignaturas: se resuelven con la API.
  if (asignaturas !== null) {
    const respuestaApi = reglasConApi(texto);
    if (respuestaApi) return respuestaApi;
  }

  const entrada = buscarEnBase(texto);
  if (entrada) {
    return { texto: entrada.respuesta, lista: entrada.lista, enlace: entrada.enlace };
  }

  // Si hablaba de asignaturas pero la API no está disponible, se explica.
  if (asignaturas === null && /(asignatura|materia|curso)/.test(texto)) return SIN_API;

  return {
    texto: 'No he entendido tu pregunta. Prueba con palabras clave como «admisión», «documentos», «minor», «salidas profesionales» o «asignaturas de 3.º curso».',
    lista: SUGERENCIAS.slice(0, 4),
  };
}

// ---------- Eventos ----------

function preguntar(texto) {
  const limpio = texto.trim();
  if (limpio === '') return;
  mostrarUsuario(limpio);
  responderConRetraso(responder(limpio));
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  preguntar(campo.value);
  campo.value = '';
  campo.focus();
});

contenedorSugerencias.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button');
  if (boton) preguntar(boton.textContent);
});

document.querySelector('#borrar').addEventListener('click', () => {
  mensajes.replaceChildren();
  mostrarAsistente({ texto: 'Conversación borrada. ¿En qué puedo ayudarte?' });
  campo.focus();
});

// ---------- Arranque ----------

for (const sugerencia of SUGERENCIAS) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'sugerencia';
  boton.textContent = sugerencia;
  contenedorSugerencias.append(boton);
}

mostrarAsistente({
  texto: '¡Hola! Soy el asistente del Grado en Ciencia de Datos e Inteligencia Artificial. Puedes escribirme o elegir una pregunta de abajo.',
});
cargarAsignaturas();
