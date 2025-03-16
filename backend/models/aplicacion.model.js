const mongoose = require('mongoose')
const { model,Schema } = mongoose;

const AplicacionSchema = new Schema({
    fecha: Date,
    seleccionado: Boolean,
    fechaSeleccion: Date,
    fechaFinalizacion: Date,
    ofertaId: { type: Schema.Types.ObjectId, ref: 'Oferta' },
    candidatoId: { type: Schema.Types.ObjectId, ref: 'Candidato' }
});

const Aplicacion = model('Aplicacion', AplicacionSchema);
module.epxorts = Aplicacion