const mongoose = require('mongoose')
const { model,Schema } = mongoose;

const OfertaSchema = new Schema({
  titulo: {
    type: String,
    required: true
  },
  descripcion: String,
  requisitos: [String],
  duracion: String,
  ubicacion: String,
  salario: Number,
  imagen: String,
  fechaPublicacion: {type: Date, default: Date.now, inmutable: true},
  fechaInicio: Date,
  fechaFin: Date,
  estado: { 
    type: String, enum: ["Activa", "Pausada", "Expirada", "Retirada"] 
  },
  sector: {
    type: String, enum: ["Hosteleria", "Otro", "Domestico", "Obra"]
  },
  valorada: {
    type: Boolean,
    default: false,
  },
  aplicaciones: [{ 
    type: Schema.Types.ObjectId, 
    ref: "Aplicacion" 
  }],
  empleadorId: {
    type: Schema.Types.ObjectId,
    ref: "EmpleadorParticular" || "EmpleadorEmpresa",
  },
});

OfertaSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Oferta = model("Oferta", OfertaSchema);
module.exports = Oferta