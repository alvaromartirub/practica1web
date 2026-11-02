// Las rutas solo conectan método + URL con una función del controlador.
const express = require('express');
const controller = require('../controllers/asignaturasController');

const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.create);

// /stats va ANTES de '/:id'; si no, "stats" se interpretaría como un identificador.
router.get('/stats', controller.getStats);

router.get('/:id', controller.getById);
router.put('/:id', controller.replace);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
