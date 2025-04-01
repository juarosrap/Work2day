const express = require("express");
const router = express.Router();
const candidatoController = require("./candidato.controller");

// Rutas para Candidatos
router.get("/", candidatoController.obtenerCandidatos);
router.get("/:id", candidatoController.obtenerCandidatoPorId);
router.post("/register", candidatoController.crearCandidato);
router.post("/login", candidatoController.loginCandidato);
router.post("/logout", candidatoController.logoutCandidato);
router.put("/:id", candidatoController.actualizarCandidato);
router.delete("/:id", candidatoController.eliminarCandidato);

module.exports = router;
