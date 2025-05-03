const express = require("express");
const router = express.Router();
const candidatoController = require("./candidato.controller");
const { verifyToken } = require("../middleware/auth");
const upload = require("../Config/multerConfig");
const multerErrorHandler = require("../middleware/multerErrorHandler");

// Rutas para Candidatos
router.get("/", candidatoController.obtenerCandidatos);
router.get("/me", verifyToken, candidatoController.getCurrentUser);
router.get("/:id", candidatoController.obtenerCandidatoPorId);
router.post("/register",upload.single('fotoPerfil'),multerErrorHandler, candidatoController.crearCandidato);
router.post("/login", candidatoController.loginCandidato);
router.post("/refresh", candidatoController.refreshToken);
router.post("/logout", candidatoController.logoutCandidato);
router.put("/:id", candidatoController.actualizarCandidato);
router.delete("/:id", candidatoController.eliminarCandidato);

module.exports = router;
