// logger.js — middleware que apunta cada petición en la terminal.
//
// Un middleware es una función que Express ejecuta CADA VEZ que llega una
// petición, antes de llegar a la ruta que la responde. Recibe:
//   req   la petición (método, URL, cabeceras, cuerpo...)
//   res   la respuesta que se enviará al cliente
//   next  una función: al llamarla, Express pasa al siguiente middleware o ruta
//
// Si NO se llama a next(), la petición se queda bloqueada y el cliente nunca
// recibe respuesta. Por eso next() va siempre al final.
function requestLogger(req, res, next) {
  // req.method: GET, POST... ; req.originalUrl: la URL completa, con ?parámetros.
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}
 
module.exports = requestLogger;