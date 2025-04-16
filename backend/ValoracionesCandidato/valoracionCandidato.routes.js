const express = require("express");
const router = express.Router();
const valoracionCandidatoController= require("./valoracionCandidato.controller");


router.get("/", valoracionCandidatoController.obtenerValoraciones);
router.get("/:id", valoracionCandidatoController.obtenerValoracionPorId);
router.get("/candidato/:candidatoId",valoracionCandidatoController.obtenerValoracionesPorCandidato);
router.post("/:id", valoracionCandidatoController.crearValoracion);
router.put("/:id", valoracionCandidatoController.actualizarValoracion);
router.delete("/:id", valoracionCandidatoController.eliminarValoracion);

module.exports = router;
