const express = require("express");
const router = express.Router();
const empleadorEmpresaController = require("./empleadorEmpresa.controller");

// Rutas para EmpleadorEmpresa
router.get("/", empleadorEmpresaController.obtenerEmpleadoresEmpresa);
router.get("/:id", empleadorEmpresaController.obtenerEmpleadorEmpresaPorId);
router.post("/", empleadorEmpresaController.crearEmpleadorEmpresa);
router.put("/:id", empleadorEmpresaController.actualizarEmpleadorEmpresa);
router.delete("/:id", empleadorEmpresaController.eliminarEmpleadorEmpresa);

module.exports = router;
