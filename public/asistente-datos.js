// Base de conocimiento del asistente.
//
// Cada entrada tiene:
//   palabras   palabras clave (sin tildes y en minúsculas). Si el usuario escribe una
//              palabra que EMPIEZA igual ("admisiones" encaja con "admision"), suma un punto.
//   respuesta  texto que dirá el asistente
//   lista      (opcional) lista de puntos que se muestra bajo la respuesta
//   enlace     (opcional) { texto, url } de la página de donde sale la información
//
// El contenido sale de las páginas del sitio (admision, noticias, plan-estudios,
// salidas-profesionales e index). Si cambias esas páginas, actualiza también esta lista.

const BASE_CONOCIMIENTO = [
  {
    id: 'grado',
    // Palabras muy generales: peso bajo para que ganen las entradas más específicas.
    peso: 0.5,
    palabras: ['grado', 'carrera', 'titulacion', 'estudiar', 'inteligencia artificial', 'ciencia de datos', 'de que trata', 'perfil'],
    respuesta:
      'El Grado en Inteligencia Artificial y Ciencia de Datos prepara para desarrollar proyectos de tecnología en equipos multidisciplinares. ' +
      'Amplía la visión de un científico de datos hasta la de un ingeniero de sistemas inteligentes, capaz de diseñar sistemas informáticos sostenibles que produzcan y procesen datos de interés para empresas y organizaciones.',
    enlace: { texto: 'Página de inicio', url: 'index.html' },
  },
  {
    id: 'datos-grado',
    palabras: ['duracion', 'cuantos cursos', 'cuantos anos', 'anos dura', 'creditos', 'ects', 'centro', 'escuela', 'donde se imparte', '324'],
    respuesta: 'Datos del grado:',
    lista: ['Duración: 5 cursos académicos', 'Créditos: 324 ECTS', 'Centro: Escuela Politécnica Superior'],
    enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html' },
  },
  {
    id: 'plan',
    palabras: ['plan de estudios', 'plan', 'asignaturas', 'materias', 'temario', 'que se estudia', 'que estudio', 'contenido'],
    respuesta:
      'El plan se reparte en 5 cursos y combina fundamentos matemáticos, programación y aprendizaje automático. ' +
      'Puedes preguntarme por un curso concreto (por ejemplo, «asignaturas de 2.º curso») o por una asignatura (por ejemplo, «háblame de Álgebra»).',
    enlace: { texto: 'Plan de estudios', url: 'plan-estudios.html#asignaturas' },
  },
  {
    id: 'admision',
    palabras: ['admision', 'admisiones', 'admitir', 'acceso', 'entrar', 'ingreso', 'solicitud', 'solicitar', 'proceso', 'fases', 'plazas', 'plazo'],
    respuesta:
      'El proceso de admisión es continuo: las solicitudes se resuelven por orden de llegada hasta cubrir las plazas. Consta de cinco fases:',
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
    id: 'documentos',
    palabras: ['documentos', 'documentacion', 'papeles', 'expediente', 'dni', 'pasaporte', 'ingles', 'certificado', 'necesito para'],
    respuesta: 'Para la admisión se necesita:',
    lista: [
      'Expediente académico de los dos últimos cursos',
      'Documento nacional de identidad o pasaporte',
      'Certificado de nivel de inglés, si se dispone de él',
    ],
    enlace: { texto: 'Documentación y contacto', url: 'admision.html#documentacion' },
  },
  {
    id: 'prueba',
    palabras: ['prueba', 'entrevista', 'examen', 'selectividad'],
    respuesta: 'La tercera fase del proceso de admisión es una prueba de acceso y una entrevista personal. Después se resuelve la solicitud y, si es favorable, se formaliza la matrícula.',
    enlace: { texto: 'Proceso de admisión', url: 'admision.html' },
  },
  {
    id: 'contacto',
    palabras: ['contacto', 'contactar', 'escribir', 'telefono', 'correo', 'email', 'oficina'],
    respuesta: 'Puedes escribir a la oficina de Admisiones o consultar los plazos actualizados en la sección de admisiones de la web oficial de CUNEF Universidad.',
    enlace: { texto: 'Admisiones de CUNEF', url: 'https://www.cunef.edu/admisiones/' },
  },
  {
    id: 'curso-admision',
    palabras: ['2027', 'proximo curso', 'curso academico', 'cuando empieza'],
    respuesta: 'La página de admisión se refiere al curso académico 2027-2028. Para los plazos oficiales consulta la web de admisiones de CUNEF Universidad.',
    enlace: { texto: 'Admisiones de CUNEF', url: 'https://www.cunef.edu/admisiones/' },
  },
  {
    id: 'minor',
    palabras: ['minor', 'minors', 'itinerario', 'especializacion', 'robotics', 'robotica', 'business', 'finance', 'finanzas'],
    respuesta:
      'Los estudiantes pueden cursar de forma optativa un Minor, un itinerario de especialización impartido en inglés. Entre los disponibles están Robotics, Data Science y Business & Finance. ' +
      'Se solicita durante la matrícula, la plaza se asigna según el expediente y se reconoce en el suplemento europeo al título.',
    enlace: { texto: 'Minor opcional', url: 'plan-estudios.html#minor' },
  },
  {
    id: 'noticia-promocion',
    palabras: ['noticia', 'noticias', 'novedades', 'promocion', 'estudiantes nuevos', 'nuevo ingreso', '1260', 'internacionales', 'historia'],
    respuesta:
      'La noticia destacada: CUNEF Universidad ha iniciado el curso 2026-2027 con 1.260 estudiantes de nuevo ingreso, la cifra más alta en sus más de 50 años de trayectoria. ' +
      'La Escuela Politécnica Superior ofrece siete titulaciones, entre ellas los dobles grados en Inteligencia Artificial y Ciencia de Datos, y en Economía e Ingeniería Matemática.',
    enlace: { texto: 'Noticias', url: 'noticias.html#promocion-2026' },
  },
  {
    id: 'puertas-abiertas',
    palabras: ['puertas abiertas', 'jornada', 'visita', 'laboratorios', 'sesion informativa'],
    respuesta: 'Se celebrará una jornada de puertas abiertas: una sesión informativa para futuros estudiantes con visita a los laboratorios. Los detalles del acceso están en la página de admisión.',
    enlace: { texto: 'Noticias', url: 'noticias.html' },
  },
  {
    id: 'salidas',
    palabras: ['salidas', 'profesionales', 'trabajo', 'trabajar', 'empleo', 'empleabilidad', 'profesion', 'futuro', 'dedicarme', 'dedicar', 'perfiles', 'oficio'],
    respuesta:
      'La web oficial de CUNEF asocia a la titulación nueve perfiles profesionales y cita la estimación de IndesIA de que harán falta más de 90.000 expertos en Ciencia de Datos e Inteligencia Artificial en los próximos años. Los perfiles son:',
    lista: [
      'Ingeniero/a de sistemas inteligentes',
      'Arquitecto/a de datos',
      'Ingeniero/a de datos',
      'Experto/a en IoT',
      'Científico/a de datos',
      'Gobierno del dato',
      'Calidad del dato',
      'Analista de datos',
      'Transformación digital en la Industria 4.0',
    ],
    enlace: { texto: 'Salidas profesionales', url: 'salidas-profesionales.html' },
  },
  {
    id: 'calculadora',
    palabras: ['calculadora', 'nota media', 'media', 'notas', 'calcular', 'expediente medio'],
    respuesta: 'Tienes una calculadora de nota media: eliges un curso, escribes las notas de sus asignaturas y calcula la media ponderada por créditos ECTS. No guarda nada.',
    enlace: { texto: 'Calculadora de notas', url: 'calculadora-notas.html' },
  },
  {
    id: 'web-oficial',
    palabras: ['web oficial', 'pagina oficial', 'cunef', 'universidad', 'informacion oficial'],
    respuesta: 'La información oficial y actualizada está en la web de CUNEF Universidad. Este sitio es un proyecto de la asignatura Programación de Aplicaciones Web.',
    enlace: { texto: 'Web de CUNEF', url: 'https://www.cunef.edu/' },
  },
];

// Perfiles profesionales: una entrada por perfil, para poder preguntar por uno concreto.
const PERFILES = [
  { nombre: 'Ingeniero/a de sistemas inteligentes', palabras: ['sistemas inteligentes'], texto: 'Diseña sistemas que combinan software, datos y modelos de inteligencia artificial para que tomen decisiones o automaticen tareas.', asig: 'Fundamentos de Programación, Estructuras de Datos y Algoritmos y Desarrollo de la IA e Inteligencia Natural' },
  { nombre: 'Arquitecto/a de datos', palabras: ['arquitecto'], texto: 'Decide cómo se organizan, almacenan y conectan los datos de una organización para que sean fáciles de usar y crezcan sin problemas.', asig: 'Bases de Datos y Computación en la Nube' },
  { nombre: 'Ingeniero/a de datos', palabras: ['ingeniero de datos', 'ingeniera de datos'], texto: 'Construye y mantiene los procesos que recogen, limpian y mueven los datos desde su origen hasta quienes los analizan.', asig: 'Bases de Datos, Programación de Aplicaciones Web y Computación en la Nube' },
  { nombre: 'Experto/a en IoT', palabras: ['iot', 'internet de las cosas', 'sensores'], texto: 'Trabaja con dispositivos conectados, como sensores y máquinas, que generan datos en tiempo real y los envían a plataformas donde se procesan.', asig: 'IoT, Redes y Sistemas Operativos y el Minor in Robotics' },
  { nombre: 'Científico/a de datos', palabras: ['cientifico', 'cientifica'], texto: 'Analiza grandes volúmenes de información y crea modelos para responder preguntas y hacer predicciones.', asig: 'Probabilidad y Estadística, Álgebra, Cálculo y Lógica Basada en Datos' },
  { nombre: 'Gobierno del dato', palabras: ['gobierno del dato', 'gobernanza'], texto: 'Define las normas sobre quién puede usar qué datos y cómo, para que se cumplan la legislación y las políticas de la empresa.', asig: 'Ética y Regulación de la Inteligencia Artificial y Ciberseguridad' },
  { nombre: 'Calidad del dato', palabras: ['calidad del dato', 'calidad de datos'], texto: 'Comprueba que los datos son correctos, completos y coherentes, y corrige los errores antes de que lleguen a los informes o a los modelos.', asig: 'Bases de Datos y Probabilidad y Estadística' },
  { nombre: 'Analista de datos', palabras: ['analista'], texto: 'Convierte los datos en informes, gráficos y conclusiones que ayudan a una organización a tomar decisiones.', asig: 'Visualización de Datos, Probabilidad y Estadística y Bases de Datos' },
  { nombre: 'Transformación digital en la Industria 4.0', palabras: ['industria', 'transformacion digital'], texto: 'Ayuda a las empresas industriales a incorporar sensores, automatización y análisis de datos en sus procesos.', asig: 'IoT, Redes y Sistemas Operativos, Ciberseguridad y las Prácticas externas' },
];

for (const p of PERFILES) {
  BASE_CONOCIMIENTO.push({
    id: `perfil-${p.nombre}`,
    palabras: p.palabras,
    // Los perfiles son más específicos que la entrada general de salidas: puntúan doble.
    peso: 2,
    respuesta: `${p.nombre}: ${p.texto} Se relaciona con ${p.asig}.`,
    enlace: { texto: 'Salidas profesionales', url: 'salidas-profesionales.html' },
  });
}
