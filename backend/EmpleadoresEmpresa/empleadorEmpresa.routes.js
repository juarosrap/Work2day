const express = require("express");
const router = express.Router();
const empleadorEmpresaController = require("./empleadorEmpresa.controller");
const { verifyToken } = require("../middleware/auth");
const upload = require("../Config/multerConfig");
const multerErrorHandler = require("../middleware/multerErrorHandler");

// Rutas para EmpleadorEmpresa
router.get("/", empleadorEmpresaController.obtenerEmpleadoresEmpresa);
router.get("/me", verifyToken, empleadorEmpresaController.getCurrentUser);
router.get("/:id", empleadorEmpresaController.obtenerEmpleadorEmpresaPorId);
router.post("/register",upload.single('fotoPerfil'),multerErrorHandler, empleadorEmpresaController.crearEmpleadorEmpresa);
router.post("/login",empleadorEmpresaController.loginEmpleadorEmpresa);
router.post("/refresh", empleadorEmpresaController.refreshToken);
router.post("/logout", empleadorEmpresaController.logoutEmpleadorEmpresa);
router.put("/:id", empleadorEmpresaController.actualizarEmpleadorEmpresa);
router.delete("/:id", empleadorEmpresaController.eliminarEmpleadorEmpresa);

module.exports = router;
