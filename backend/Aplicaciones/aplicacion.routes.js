const express = require("express");
const router = express.Router();
const aplicacionController = require("./aplicacion.controller");

// Rutas para Aplicaciones
router.get("/", aplicacionController.obtenerAplicaciones);
router.get("/:id", aplicacionController.obtenerAplicacionPorId);
router.post("/", aplicacionController.crearAplicacion);
router.put("/:id", aplicacionController.actualizarAplicacion);
router.delete("/:id", aplicacionController.eliminarAplicacion);

module.exports = router;
