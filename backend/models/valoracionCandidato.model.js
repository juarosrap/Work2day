const mongoose = require('mongoose')
const { model,Schema } = mongoose;

const ValoracionCandidatoSchema = new Schema({
  puntuacion: Number,
  reseña: String,
  fecha: Date,
  candidatoId: { type: Schema.Types.ObjectId, ref: "Candidato" },
  empleadorId: {
    type: Schema.Types.ObjectId,
    ref: "EmpleadorParticular" || "EmpleadorEmpresa",
  },
});

const ValoracionCandidato = model(
  "ValoracionCandidato",
  ValoracionCandidatoSchema
);

module.exports = ValoracionCandidato