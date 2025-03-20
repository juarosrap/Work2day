const mongoose = require('mongoose')
const { model,Schema } = mongoose;

const ValoracionEmpleadorSchema = new Schema({
  puntuacion: {
    type: Number,
    required: true,
  },
  reseña: {
    type: String,
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  candidatoId: { type: Schema.Types.ObjectId, ref: "Candidato" },
  empleadorId: {
    type: Schema.Types.ObjectId,
    ref: "EmpleadorParticular" || "EmpleadorEmpresa",
  },
});

ValoracionEmpleadorSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  } 
});

const ValoracionEmpleador = model(
  "ValoracionEmpleador",
  ValoracionEmpleadorSchema
);

module.exports = ValoracionEmpleador;