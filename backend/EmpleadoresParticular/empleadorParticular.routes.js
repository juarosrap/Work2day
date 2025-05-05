const express = require("express");
const router = express.Router();
const empleadorParticularController = require("./empleadorParticular.controller");
const { verifyToken } = require("../middleware/auth");
const upload = require("../Config/multerConfig");
const multerErrorHandler = require("../middleware/multerErrorHandler");

// Rutas para EmpleadorParticular
router.get("/", empleadorParticularController.obtenerEmpleadoresParticular);
router.get("/me", verifyToken, empleadorParticularController.getCurrentUser);
router.get("/:id",empleadorParticularController.obtenerEmpleadorParticularPorId);
router.post("/register",upload.single("fotoPerfil"),multerErrorHandler,empleadorParticularController.crearEmpleadorParticular);
router.post("/login",empleadorParticularController.loginEmpleadorParticular);
router.post("/refresh", empleadorParticularController.refreshToken);
router.post("/logout", empleadorParticularController.logoutEmpleadorParticular);
router.put(
  "/:id",
  upload.single("fotoPerfil"),
  multerErrorHandler,
  empleadorParticularController.actualizarEmpleadorParticular
);
router.delete("/:id",empleadorParticularController.eliminarEmpleadorParticular);

module.exports = router;
