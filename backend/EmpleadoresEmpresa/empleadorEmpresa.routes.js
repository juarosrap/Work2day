const express = require("express");
const router = express.Router();
const empleadorEmpresaController = require("./empleadorEmpresa.controller");

// Rutas para EmpleadorEmpresa
router.get("/", empleadorEmpresaController.obtenerEmpleadoresEmpresa);
router.get("/:id", empleadorEmpresaController.obtenerEmpleadorEmpresaPorId);
router.post("/register", empleadorEmpresaController.crearEmpleadorEmpresa);
router.post("/login",empleadorEmpresaController.loginEmpleadorEmpresa);
router.post("/refresh", empleadorEmpresaController.refreshToken);
router.post("/logout", empleadorEmpresaController.logoutEmpleadorEmpresa);
router.put("/:id", empleadorEmpresaController.actualizarEmpleadorEmpresa);
router.delete("/:id", empleadorEmpresaController.eliminarEmpleadorEmpresa);

module.exports = router;
