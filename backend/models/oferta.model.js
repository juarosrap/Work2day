const mongoose = require('mongoose')
const { model,Schema } = mongoose;

const OfertaSchema = new Schema({
  titulo: String,
  descripcion: String,
  requisitos: [String],
  duracion: String,
  ubicacion: String,
  salario: Number,
  imagen: String,
  estado: { type: String, enum: ["Abierta", "Cerrada", "Pendiente"] },
  aplicaciones: [{ type: Schema.Types.ObjectId, ref: "Aplicacion" }],
  empleadorId: {
    type: Schema.Types.ObjectId,
    ref: "EmpleadorParticular" || "EmpleadorEmpresa",
  },
});

const Oferta = model("Oferta", OfertaSchema);
module.exports = Oferta