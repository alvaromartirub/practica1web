// =====================================================================
// logger.js — middleware que apunta cada petición en la terminal
// =====================================================================
//
// ¿QUÉ ES UN MIDDLEWARE?
//   Una función que Express ejecuta CADA VEZ que llega una petición, antes
//   de llegar a la ruta que la responde. Es como un control por el que pasan
//   todos los clientes antes de entrar. Recibe tres cosas:
//
//     req   (request)   la petición: método, URL, cabeceras, cuerpo...
//     res   (response)  la respuesta que se enviará al cliente
//     next              una función: al llamarla, Express sigue con el
//                       siguiente paso (otro middleware o la ruta)
//
//   IMPORTANTE: un middleware tiene que hacer una de dos cosas, responder
//   o llamar a next(). Si no hace ninguna, el cliente se queda esperando
//   para siempre.
//
// ¿QUÉ HACE ESTE?
//   Escribe en la terminal una línea por petición, cuando esta termina:
//
//       GET /asignaturas?area=etica 200 3ms
//       │   │                       │   └─ tiempo que tardó
//       │   │                       └───── código de estado de la respuesta
//       │   └───────────────────────────── URL completa pedida
//       └───────────────────────────────── método HTTP
//
//   No cambia nada de lo que ocurre; solo deja constancia. Es muy útil para
//   ver qué pide el navegador y qué responde la API mientras pruebas.

function logger(req, res, next) {
  // 1. Se guarda el instante en que ENTRA la petición (en milisegundos).
  //    Date.now() devuelve el número de milisegundos desde 1970; no importa
  //    el valor, sino la resta que haremos luego.
  const inicio = Date.now();

  // 2. ¿Por qué no hacemos el console.log aquí mismo?
  //    Porque en este momento la respuesta todavía NO existe: aún no se sabe
  //    si será un 200 o un 404, ni cuánto va a tardar.
  //
  //    La solución es dejar un aviso: "cuando la respuesta termine de
  //    enviarse (evento 'finish'), ejecuta esta función". Express la llamará
  //    más tarde, sola, y entonces sí tenemos todos los datos.
  res.on('finish', () => {
    // Tiempo transcurrido = ahora - cuando entró.
    const ms = Date.now() - inicio;

    // req.method        GET, POST, PUT, PATCH, DELETE...
    // req.originalUrl   la URL completa tal como llegó, con los parámetros
    //                   (?area=etica). Se usa esta y no req.url porque
    //                   dentro de un router req.url pierde la primera parte.
    // res.statusCode    200, 201, 404...
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });

  // 3. Se deja pasar la petición. Sin esta línea, el servidor no
  //    respondería nunca.
  next();
}

// Se exporta la función para usarla en app.js con: app.use(logger)
module.exports = logger;
