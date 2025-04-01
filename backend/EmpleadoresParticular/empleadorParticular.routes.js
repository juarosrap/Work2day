const express = require("express");
const router = express.Router();
const empleadorParticularController = require("./empleadorParticular.controller");

// Rutas para EmpleadorParticular
router.get("/", empleadorParticularController.obtenerEmpleadoresParticular);
router.get("/:id",empleadorParticularController.obtenerEmpleadorParticularPorId);
router.post("/register", empleadorParticularController.crearEmpleadorParticular);
router.post("/login",empleadorParticularController.loginEmpleadorParticular);
router.put("/:id", empleadorParticularController.actualizarEmpleadorParticular);
router.delete("/:id",empleadorParticularController.eliminarEmpleadorParticular);

module.exports = router;
