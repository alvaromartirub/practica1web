// =====================================================================
// server.js — punto de entrada: arranca el servidor
// =====================================================================
//
// Es lo que ejecuta "npm start" (ver package.json). Solo hace una cosa:
// coger la aplicación de app.js y ponerla a escuchar en un puerto.

const app = require('./app');

// Usa el puerto de la variable de entorno PORT si existe (útil para probar
// en otro puerto: PORT=4000 npm start); si no, el 3000.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
