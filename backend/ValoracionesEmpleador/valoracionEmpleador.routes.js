const express = require("express");
const router = express.Router();
const valoracionEmpleadorController = require("./valoracionEmpleador.controller");

//Rutas para valoracionEmpleador
router.get("/", valoracionEmpleadorController.obtenerValoraciones);
router.get("/:id", valoracionEmpleadorController.obtenerValoracionPorId);
router.get(
  "/empleador/:empleadorId",
  valoracionEmpleadorController.obtenerValoracionesPorEmpleador
);
router.post("/:id", valoracionEmpleadorController.crearValoracion);
router.put("/:id", valoracionEmpleadorController.actualizarValoracion);
router.delete("/:id", valoracionEmpleadorController.eliminarValoracion);

module.exports = router;
