const mongoose = require('mongoose')
const { model,Schema } = mongoose;

const ValoracionEmpleadorSchema = new Schema({
  puntuacion: Number,
  reseña: String,
  fecha: Date,
  candidatoId: { type: Schema.Types.ObjectId, ref: "Candidato" },
  empleadorId: {
    type: Schema.Types.ObjectId,
    ref: "EmpleadorParticular" || "EmpleadorEmpresa",
  },
});

const ValoracionEmpleador = model(
  "ValoracionEmpleador",
  ValoracionEmpleadorSchema
);

module.exports = ValoracionEmpleador;