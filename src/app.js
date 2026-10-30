// =====================================================================
// app.js — construye la aplicación Express (sin ponerla a escuchar)
// =====================================================================
//
// Aquí se decide QUÉ pasa con cada petición, y el ORDEN IMPORTA: Express
// recorre los app.use(...) de arriba abajo y se queda con el primero que
// responde. El orden de este archivo es:
//
//   1. logger          apunta la petición
//   2. express.json()  convierte el cuerpo JSON en req.body
//   3. express.static  si piden un archivo de public/, lo entrega
//   4. /health y /asignaturas   las rutas de la API
//   5. 404             nada de lo anterior respondió
//   6. errores         lo que falle en cualquier paso anterior acaba aquí
//
// Se exporta la app en vez de arrancarla para que server.js la arranque
// y las pruebas automáticas (Supertest) puedan usarla sin abrir un puerto.

const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const asignaturasRouter = require('./routes/asignaturas');

const app = express();

// 1. Registro de peticiones (el primero, para que apunte también los errores).
app.use(logger);

// 2. Lee el cuerpo de las peticiones POST/PUT/PATCH cuando es JSON y lo deja
//    en req.body. Si el JSON está mal escrito lanza un error que recoge el
//    manejador del final (paso 6).
app.use(express.json());

// 3. Contenido estático: sirve la carpeta public/ (index.html, styles.css...).
//    Como la página y la API salen del MISMO servidor, comparten origen y
//    no hace falta configurar CORS.
//    __dirname es la carpeta de este archivo (src/); ".." sube a la raíz.
app.use(express.static(path.join(__dirname, '..', 'public')));

// 4. Rutas de la API.
//    /health sirve para comprobar rápido que el servidor está vivo.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

//    Todo lo que empiece por /asignaturas lo gestiona routes/asignaturas.js.
app.use('/asignaturas', asignaturasRouter);

// 5. Ruta no encontrada. Si la petición llega hasta aquí es que ninguna de
//    las anteriores la ha respondido. Se contesta en JSON, no en HTML.
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 6. Manejador centralizado de errores. Express lo reconoce porque tiene
//    CUATRO parámetros (err, req, res, next) y debe ser el ÚLTIMO middleware.
//    No se envía la traza al cliente: puede revelar detalles internos.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // JSON mal escrito en el cuerpo -> es culpa del cliente, 400.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      errors: [{ field: 'body', message: 'El cuerpo de la petición no es JSON válido' }],
    });
  }
  // Cualquier otro fallo es nuestro: se apunta en la terminal y se responde 500.
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
