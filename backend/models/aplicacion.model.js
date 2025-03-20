const mongoose = require('mongoose')
const { model,Schema } = mongoose;

const AplicacionSchema = new Schema({
    fecha: {
      type: Date,
      default: Date.now
    },
    seleccionado: Boolean,
    fechaSeleccion: Date,
    fechaFinalizacion: Date,
    ofertaId: { type: Schema.Types.ObjectId, ref: 'Oferta' },
    candidatoId: { type: Schema.Types.ObjectId, ref: 'Candidato' }
});

AplicacionSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Aplicacion = model('Aplicacion', AplicacionSchema);
module.exports = Aplicacion