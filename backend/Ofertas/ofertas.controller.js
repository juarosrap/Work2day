const Oferta = require("./oferta.model");
const Aplicacion = require("../Aplicaciones/aplicacion.model");
const EmpleadorEmpresa = require("../EmpleadoresEmpresa/empleadorEmpresa.model");
const EmpleadorParticular = require("../EmpleadoresParticular/empleadorParticular.model");
const Candidato = require("../Candidatos/candidato.model");
const fs = require("fs");
const path = require("path");

exports.getAllOfertas = async (req, res) => {
  try {
    const ofertas = await Oferta.find().populate("aplicaciones");
    res.json(ofertas);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener ofertas", detalle: error.message });
  }
};

exports.getOfertasByEstado = async (req, res) => {
  try {
    const ofertas = await Oferta.find({ estado: req.params.estado }).populate(
      "aplicaciones"
    );
    res.json(ofertas);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener ofertas", detalle: error.message });
  }
};

exports.getOfertasByUbicacion = async (req, res) => {
  try {
    const ofertas = await Oferta.find({
      ubicacion: { $regex: req.params.ubicacion, $options: "i" },
    });
    res.json(ofertas);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener ofertas", detalle: error.message });
  }
};

exports.getOfertaById = async (req, res) => {
  try {
    const oferta = await Oferta.findById(req.params.id).populate({
      path: "aplicaciones",
      populate: { path: "candidatoId" },
    });

    if (!oferta) return res.status(404).json({ error: "Oferta no encontrada" });

    let empleador =
      (await EmpleadorEmpresa.findById(oferta.empleadorId)) ||
      (await EmpleadorParticular.findById(oferta.empleadorId));

    if (!empleador)
      return res.status(404).json({ error: "Empleador no encontrado" });

    const ofertaObj = oferta.toObject();

    ofertaObj.aplicaciones = ofertaObj.aplicaciones.map((ap) => {
      if (ap.candidatoId && ap.candidatoId.contrasena)
        delete ap.candidatoId.contrasena;
      return ap;
    });

    const empleadorObj = empleador.toObject();
    delete empleadorObj.contrasena;

    res.json({ ...ofertaObj, empleador: empleadorObj });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener la oferta", detalle: error.message });
  }
};

exports.getOfertasByEmpleador = async (req, res) => {
  try {
    const ofertas = await Oferta.find({ empleadorId: req.params.empleadorId });
    res.json(ofertas);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener las ofertas", detalle: error.message });
  }
};

exports.createOferta = async (req, res) => {
  try {
    let imagenPath = null;
    if (req.file) {
      imagenPath = `/uploads/ofertas/${req.file.filename}`;
    }

    const nuevaOferta = new Oferta({
      ...req.body,
      imagen: imagenPath,
      estado: req.body.estado || "Abierta",
    });

    const ofertaGuardada = await nuevaOferta.save();

    const esEmpresa = await EmpleadorEmpresa.findById(
      ofertaGuardada.empleadorId
    );
    if (esEmpresa) {
      await EmpleadorEmpresa.findByIdAndUpdate(ofertaGuardada.empleadorId, {
        $push: { ofertas: ofertaGuardada._id },
      });
    } else {
      await EmpleadorParticular.findByIdAndUpdate(ofertaGuardada.empleadorId, {
        $push: { ofertas: ofertaGuardada._id },
      });
    }

    res.status(201).json(ofertaGuardada);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res
      .status(500)
      .json({ error: "Error al crear oferta", detalle: error.message });
  }
};

exports.updateOferta = async (req, res) => {
  try {
    const datosActualizacion = { ...req.body };

    if (req.file) {
      const ofertaActual = await Oferta.findById(req.params.id);
      if (
        ofertaActual &&
        ofertaActual.imagen &&
        ofertaActual.imagen.startsWith("/uploads/")
      ) {
        const rutaAnterior = path.join(__dirname, "..", ofertaActual.imagen);
        if (fs.existsSync(rutaAnterior)) {
          fs.unlinkSync(rutaAnterior);
        }
      }
      datosActualizacion.imagen = `/uploads/ofertas/${req.file.filename}`;
    }

    const ofertaActualizada = await Oferta.findByIdAndUpdate(
      req.params.id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    if (!ofertaActualizada) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Oferta no encontrada" });
    }

    res.json(ofertaActualizada);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res
      .status(500)
      .json({ error: "Error al actualizar oferta", detalle: error.message });
  }
};

exports.deleteOferta = async (req, res) => {
  try {
    const oferta = await Oferta.findById(req.params.id);
    if (!oferta) return res.status(404).json({ error: "Oferta no encontrada" });

    if (oferta.imagen && oferta.imagen.startsWith("/uploads/")) {
      const rutaImagen = path.join(__dirname, "..", oferta.imagen);
      if (fs.existsSync(rutaImagen)) fs.unlinkSync(rutaImagen);
    }

    const aplicaciones = await Aplicacion.find({ ofertaId: req.params.id });
    for (const aplicacion of aplicaciones) {
      await Candidato.findByIdAndUpdate(aplicacion.candidatoId, {
        $pull: { aplicaciones: aplicacion._id },
      });
    }
    await Aplicacion.deleteMany({ ofertaId: req.params.id });

    const esEmpresa = await EmpleadorEmpresa.findOne({
      ofertas: req.params.id,
    });
    if (esEmpresa) {
      await EmpleadorEmpresa.findByIdAndUpdate(oferta.empleadorId, {
        $pull: { ofertas: req.params.id },
      });
    } else {
      await EmpleadorParticular.findByIdAndUpdate(oferta.empleadorId, {
        $pull: { ofertas: req.params.id },
      });
    }

    await Oferta.findByIdAndDelete(req.params.id);

    res.json({ mensaje: "Oferta y sus aplicaciones eliminadas correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar oferta", detalle: error.message });
  }
};
