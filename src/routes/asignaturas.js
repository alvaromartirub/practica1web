// =====================================================================
// routes/asignaturas.js — la "carta": qué URL y qué método hace cada cosa
// =====================================================================
//
// Una ruta conecta MÉTODO + URL con una función del controlador. Aquí no hay
// lógica: solo se dice "si llega un GET a /asignaturas, que lo atienda listar".
//
// En app.js se montó este router con app.use('/asignaturas', ...), así que
// todas las rutas de abajo empiezan ya por /asignaturas:
//
//     router.get('/')      ->  GET    /asignaturas
//     router.get('/:id')   ->  GET    /asignaturas/3
//
// ":id" es un hueco: vale cualquier valor y llega al controlador en req.params.id.

const express = require('express');
const controller = require('../controllers/asignaturasController');

const router = express.Router();

router.get('/', controller.listar); // lista (con filtros opcionales)
router.post('/', controller.crear); // crea una asignatura

// TANDA 3: aquí irá router.get('/stats', ...) ANTES de '/:id'.
// Express lee las rutas de arriba abajo y se queda con la primera que encaja;
// si '/:id' estuviera antes, "stats" se tomaría por un id.

router.get('/:id', controller.obtener); // una asignatura por id
router.delete('/:id', controller.eliminar); // borra una asignatura

// TANDA 2: aquí irán router.put('/:id', ...) y router.patch('/:id', ...).

module.exports = router;
