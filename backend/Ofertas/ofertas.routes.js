const express = require("express");
const router = express.Router();
const ofertaController = require("./ofertas.controller");

// Rutas para ofertas
router.get("/", ofertaController.getAllOfertas);
router.get("/estado/:estado", ofertaController.getOfertasByEstado);
router.get("ubicacion/:ubicacion",ofertaController.getOfertasByUbicacion);
router.get("/:id", ofertaController.getOfertaById);
router.get("/empleador/:empleadorId",ofertaController.getOfertasByEmpleador);
router.post("/", ofertaController.createOferta);
router.put("/:id", ofertaController.updateOferta);
router.delete("/:id", ofertaController.deleteOferta);

module.exports = router;
