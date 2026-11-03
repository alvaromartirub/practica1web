const express = require("express");
const {
  listAsignaturas,
  getStats,
  getAsignatura,
  createAsignatura,
  replaceAsignatura,
  updateAsignatura,
  deleteAsignatura,
} = require("../controllers/asignaturasController");
 
// Las rutas solo conectan método + URL con una función del controlador.
const router = express.Router();
 
router.get("/", listAsignaturas);
 
// /stats va ANTES de "/:id"; si no, "stats" se interpretaría como un identificador.
router.get("/stats", getStats);
 
router.get("/:id", getAsignatura);
router.post("/", createAsignatura);
router.put("/:id", replaceAsignatura);
router.patch("/:id", updateAsignatura);
router.delete("/:id", deleteAsignatura);
 
module.exports = router;
 