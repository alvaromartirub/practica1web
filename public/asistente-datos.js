// Datos del asistente: categorías con preguntas ya escritas y su respuesta.
//
// Cada categoría tiene una lista de preguntas. Cada pregunta tiene:
//   texto      lo que se ve en el botón (y en la burbuja del usuario al pulsarlo)
//   respuesta  texto que contesta el asistente
//   lista      (opcional) lista de puntos bajo la respuesta
//   enlace     (opcional) { texto, url } de la página de donde sale la información
//   api        (opcional) si está, la respuesta NO es fija: se pide a la API.
//              { url, intro, tipo, respaldo? }
//                url      dirección de la API que se consulta con fetch
//                intro    frase con la que empieza la respuesta
//                tipo     'lista' (lista de asignaturas), 'resumen' (stats) o 'areas' (stats por área)
//                respaldo (opcional) función que filtra PLAN_RESPALDO si la API no responde
//
// El contenido sale de las páginas del sitio (admision, noticias, plan-estudios,
// salidas-profesionales e index). Si cambias esas páginas, actualiza también este archivo.

// Perfiles profesionales: de aquí salen las preguntas de la categoría "Salidas profesionales".
const PERFILES = [
  { nombre: 'Ingeniero/a de sistemas inteligentes', palabras: ['sistemas inteligentes', 'ingeniero de sistemas', 'ingeniera de sistemas'], texto: 'Diseña sistemas que combinan software, datos y modelos de inteligencia artificial para que tomen decisiones o automaticen tareas.', asig: 'Fundamentos de Programación, Estructuras de Datos y Algoritmos y Desarrollo de la IA e Inteligencia Natural' },
  { nombre: 'Arquitecto/a de datos', palabras: ['arquitecto', 'arquitecta', 'arquitectura de datos'], texto: 'Decide cómo se organizan, almacenan y conectan los datos de una organización para que sean fáciles de usar y crezcan sin problemas.', asig: 'Bases de Datos y Computación en la Nube' },
  { nombre: 'Ingeniero/a de datos', palabras: ['ingeniero de datos', 'ingeniera de datos', 'data engineer', 'pipelines'], texto: 'Construye y mantiene los procesos que recogen, limpian y mueven los datos desde su origen hasta quienes los analizan.', asig: 'Bases de Datos, Programación de Aplicaciones Web y Computación en la Nube' },
  { nombre: 'Experto/a en IoT', palabras: ['iot', 'internet de las cosas', 'sensores', 'dispositivos conectados', 'experto en iot'], texto: 'Trabaja con dispositivos conectados, como sensores y máquinas, que generan datos en tiempo real y los envían a plataformas donde se procesan.', asig: 'IoT, Redes y Sistemas Operativos y el Minor in Robotics' },
  { nombre: 'Científico/a de datos', palabras: ['cientifico', 'cientifica', 'data scientist', 'modelos predictivos'], texto: 'Analiza grandes volúmenes de información y crea modelos para responder preguntas y hacer predicciones.', asig: 'Probabilidad y Estadística, Álgebra, Cálculo y Lógica Basada en Datos' },
  { nombre: 'Gobierno del dato', palabras: ['gobierno del dato', 'gobierno de datos', 'gobernanza', 'normativa de datos'], texto: 'Define las normas sobre quién puede usar qué datos y cómo, para que se cumplan la legislación y las políticas de la empresa.', asig: 'Ética y Regulación de la Inteligencia Artificial y Ciberseguridad' },
  { nombre: 'Calidad del dato', palabras: ['calidad del dato', 'calidad de datos', 'limpieza de datos'], texto: 'Comprueba que los datos son correctos, completos y coherentes, y corrige los errores antes de que lleguen a los informes o a los modelos.', asig: 'Bases de Datos y Probabilidad y Estadística' },
  { nombre: 'Analista de datos', palabras: ['analista', 'analisis de datos', 'informes', 'data analyst'], texto: 'Convierte los datos en informes, gráficos y conclusiones que ayudan a una organización a tomar decisiones.', asig: 'Visualización de Datos, Probabilidad y Estadística y Bases de Datos' },
  { nombre: 'Transformación digital en la Industria 4.0', palabras: ['industria', 'industria 4 0', 'transformacion digital', 'industrial', 'automatizacion'], texto: 'Ayuda a las empresas industriales a incorporar sensores, automatización y análisis de datos en sus procesos.', asig: 'IoT, Redes y Sistemas Operativos, Ciberseguridad y las Prácticas externas' },
];


// Preguntas de la categoría "Cursos": una por curso, consultando la API.
const PREGUNTAS_CURSOS = [];
for (let curso = 1; curso <= 5; curso++) {
  PREGUNTAS_CURSOS.push({
    texto: `¿Qué asignaturas hay en ${curso}.º curso?`,
    api: {
      url: `/asignaturas?curso=${curso}&sort=nombre&order=asc`,
      intro: `Asignaturas de ${curso}.º curso`,
      tipo: 'lista',
      respaldo: (a) => a.curso === curso,
    },
    enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
  });
}

// Preguntas de la categoría "Asignaturas": todas, y una por área.
const PREGUNTAS_ASIGNATURAS = [
  {
    texto: '¿Cuáles son todas las asignaturas?',
    api: { url: '/asignaturas?sort=curso&order=asc', intro: 'Asignaturas del grado', tipo: 'lista', respaldo: () => true },
    enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
  },
];
const AREAS = [
  ['programacion', 'Programación'],
  ['matematicas', 'Matemáticas'],
  ['datos-ia', 'Datos e IA'],
  ['sistemas', 'Sistemas'],
  ['etica', 'Ética'],
];
for (const [valor, nombre] of AREAS) {
  PREGUNTAS_ASIGNATURAS.push({
    texto: `¿Qué asignaturas son de ${nombre}?`,
    api: { url: `/asignaturas?area=${valor}&sort=curso&order=asc`, intro: `Asignaturas del área ${nombre}`, tipo: 'lista' },
    enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
  });
}

// Preguntas de la categoría "Salidas profesionales": una general y una por perfil.
const PREGUNTAS_SALIDAS = [
  {
    texto: '¿Qué salidas profesionales tiene el grado?',
    respuesta:
      'La web oficial de CUNEF asocia a la titulación nueve perfiles profesionales y cita la estimación de IndesIA de que harán falta más de 90.000 expertos en Ciencia de Datos e Inteligencia Artificial en los próximos años. Los perfiles son:',
    lista: PERFILES.map((p) => p.nombre),
    enlace: { texto: 'Salidas profesionales', url: 'salidas-profesionales.html' },
  },
];
for (const p of PERFILES) {
  PREGUNTAS_SALIDAS.push({
    texto: `¿Qué hace un/a ${p.nombre.toLowerCase()}?`,
    respuesta: `${p.nombre}: ${p.texto} Se relaciona con ${p.asig}.`,
    enlace: { texto: 'Salidas profesionales', url: 'salidas-profesionales.html' },
  });
}

const CATEGORIAS = [
  {
    id: 'grado',
    nombre: 'Grado',
    preguntas: [
      {
        texto: '¿De qué trata el grado?',
        respuesta:
          'El Grado en Inteligencia Artificial y Ciencia de Datos prepara para desarrollar proyectos de tecnología en equipos multidisciplinares. ' +
          'Amplía la visión de un científico de datos hasta la de un ingeniero de sistemas inteligentes, capaz de diseñar sistemas informáticos sostenibles que produzcan y procesen datos de interés para empresas y organizaciones.',
        enlace: { texto: 'Página de inicio', url: 'index.html' },
      },
      {
        texto: '¿Cuánto dura y cuántos créditos tiene?',
        respuesta: 'Datos del grado:',
        lista: ['Duración: 5 cursos académicos', 'Créditos: 324 ECTS', 'Centro: Escuela Politécnica Superior'],
        enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html' },
      },
      {
        texto: '¿Qué es un Minor?',
        respuesta:
          'Los estudiantes pueden cursar de forma optativa un Minor, un itinerario de especialización impartido en inglés. Entre los disponibles están Robotics, Data Science y Business & Finance. ' +
          'Se solicita durante la matrícula, la plaza se asigna según el expediente y se reconoce en el suplemento europeo al título.',
        enlace: { texto: 'Minor opcional', url: 'plan-estudios.html#minor' },
      },
      {
        texto: '¿Qué novedades hay?',
        respuesta:
          'La noticia destacada: CUNEF Universidad ha iniciado el curso 2026-2027 con 1.260 estudiantes de nuevo ingreso, la cifra más alta en sus más de 50 años de trayectoria. ' +
          'La Escuela Politécnica Superior ofrece siete titulaciones, entre ellas los dobles grados en Inteligencia Artificial y Ciencia de Datos, y en Economía e Ingeniería Matemática.',
        enlace: { texto: 'Noticias', url: 'noticias.html#promocion-2026' },
      },
      {
        texto: '¿Qué se aprende en Programación de Aplicaciones Web?',
        respuesta:
          'Es una asignatura de segundo curso: se aprende a construir una aplicación web completa con HTML semántico, estilos responsive, JavaScript en el navegador y una API REST con Node.js y Express. Este sitio es el proyecto de esa asignatura.',
        enlace: { texto: 'Ficha de la asignatura', url: 'asignatura-detalle.html' },
      },
    ],
  },
  {
    id: 'plan',
    nombre: 'Plan de estudios',
    preguntas: [
      {
        texto: '¿Cómo es el plan de estudios?',
        respuesta:
          'El plan se reparte en 5 cursos y combina fundamentos matemáticos, programación y aprendizaje automático. ' +
          'Para ver las asignaturas de un curso o de un área, usa las categorías «Cursos» y «Asignaturas».',
        enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
      },
      {
        texto: '¿Cuántas asignaturas y créditos hay en total?',
        api: { url: '/asignaturas/stats', intro: 'Resumen del catálogo', tipo: 'resumen' },
        enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
      },
      {
        texto: '¿Cuántas asignaturas hay en cada área?',
        api: { url: '/asignaturas/stats', intro: 'Asignaturas por área', tipo: 'areas' },
        enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
      },
      {
        texto: '¿Cómo calculo mi nota media?',
        respuesta: 'Tienes una calculadora de nota media: eliges un curso, escribes las notas de sus asignaturas y calcula la media ponderada por créditos ECTS. No guarda nada.',
        enlace: { texto: 'Calculadora de notas', url: 'calculadora-notas.html' },
      },
    ],
  },
  { id: 'cursos', nombre: 'Cursos', preguntas: PREGUNTAS_CURSOS },
  { id: 'asignaturas', nombre: 'Asignaturas', preguntas: PREGUNTAS_ASIGNATURAS },
  {
    id: 'admision',
    nombre: 'Admisión',
    preguntas: [
      {
        texto: '¿Cómo es el proceso de admisión?',
        respuesta: 'El proceso de admisión es continuo: las solicitudes se resuelven por orden de llegada hasta cubrir las plazas. Consta de cinco fases:',
        lista: [
          'Solicitud de información y contacto con el departamento de Admisiones',
          'Entrega de la documentación académica requerida',
          'Prueba de acceso y entrevista personal',
          'Resolución de la solicitud de admisión',
          'Formalización de la matrícula',
        ],
        enlace: { texto: 'Proceso de admisión', url: 'admision.html' },
      },
      {
        texto: '¿Qué documentos necesito?',
        respuesta: 'Para la admisión se necesita:',
        lista: [
          'Expediente académico de los dos últimos cursos',
          'Documento nacional de identidad o pasaporte',
          'Certificado de nivel de inglés, si se dispone de él',
        ],
        enlace: { texto: 'Documentación y contacto', url: 'admision.html#documentacion' },
      },
      {
        texto: '¿Hay que hacer una prueba o entrevista?',
        respuesta: 'La tercera fase del proceso de admisión es una prueba de acceso y una entrevista personal. Después se resuelve la solicitud y, si es favorable, se formaliza la matrícula.',
        enlace: { texto: 'Proceso de admisión', url: 'admision.html' },
      },
      {
        texto: '¿Cómo contacto con Admisiones?',
        respuesta: 'Puedes escribir a la oficina de Admisiones o consultar los plazos actualizados en la sección de admisiones de la web oficial de CUNEF Universidad.',
        enlace: { texto: 'Admisiones de CUNEF', url: 'https://www.cunef.edu/admisiones/' },
      },
      {
        texto: '¿Para qué curso es la admisión?',
        respuesta: 'La página de admisión se refiere al curso académico 2027-2028. Para los plazos oficiales consulta la web de admisiones de CUNEF Universidad.',
        enlace: { texto: 'Admisiones de CUNEF', url: 'https://www.cunef.edu/admisiones/' },
      },
      {
        texto: '¿Hay jornadas de puertas abiertas?',
        respuesta: 'Se celebrará una jornada de puertas abiertas: una sesión informativa para futuros estudiantes con visita a los laboratorios. Los detalles del acceso están en la página de admisión.',
        enlace: { texto: 'Noticias', url: 'noticias.html' },
      },
    ],
  },
  { id: 'salidas', nombre: 'Salidas profesionales', preguntas: PREGUNTAS_SALIDAS },
];

// Lista de reserva con las asignaturas de plan-estudios.html. El asistente la usa SOLO si la
// API no responde, para poder seguir contestando preguntas sobre asignaturas.
// Cuando la API funciona, los datos (créditos, tipo, área) salen siempre de ella.
const PLAN_RESPALDO = [
  ['Fundamentos de Programación', 1], ['Álgebra', 1], ['Cálculo', 1], ['Probabilidad y Estadística', 1],
  ['Estructuras de Datos y Algoritmos', 2], ['Bases de Datos', 2], ['Programación de Aplicaciones Web', 2],
  ['Matemática Discreta', 3], ['Desarrollo de la IA e Inteligencia Natural', 3], ['Redes y Sistemas Operativos', 3], ['Computación en la Nube', 3],
  ['Lógica Basada en Datos', 4], ['Ciberseguridad', 4], ['Procesamiento del Lenguaje Natural', 4], ['Visualización de Datos', 4],
  ['Ética y Regulación de la Inteligencia Artificial', 5], ['IoT', 5], ['Prácticas externas', 5], ['Trabajo Fin de Grado', 5],
].map(([nombre, curso], i) => ({ id: i + 1, nombre, curso, obligatoria: true }));
