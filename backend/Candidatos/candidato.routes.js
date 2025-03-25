const express = require("express");
const router = express.Router();
const candidatoController = require("./candidato.controller");

// Rutas para Candidatos
router.get("/", candidatoController.obtenerCandidatos);
router.get("/:id", candidatoController.obtenerCandidatoPorId);
router.post("/", candidatoController.crearCandidato);
router.put("/:id", candidatoController.actualizarCandidato);
router.delete("/:id", candidatoController.eliminarCandidato);

module.exports = router;
