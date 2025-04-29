const mongoose = require('mongoose')
const { model,Schema } = mongoose;

const EmpleadorEmpresaSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
    required: true,
  },
  fotoPerfil: String,
  fechaNacimiento: {
    type: Date,
    required: true,
  },
  contrasena: {
    type: String,
    required: true,
  },
  nombreEmpresa: {
    type: String,
    required: true,
  },
  descripcion: String,
  sector: {
    type: String,
    required: true,
  },
  ubicacion: String,
  fotoEmpresa: String,
  correoEmpresa: {
    type: String,
    required: true,
  },
  telefonoEmpresa: {
    type: String,
    required: true,
  },
  paginaWeb: String,
  ofertas: [
    {
      type: Schema.Types.ObjectId,
      ref: "Oferta",
    },
  ],
  valoraciones: [
    {
      type: Schema.Types.ObjectId,
      ref: "ValoracionEmpleador",
    },
  ],
});

EmpleadorEmpresaSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.contrasena;
  }
});


const EmpleadorEmpresa = model('EmpleadorEmpresa', EmpleadorEmpresaSchema);
module.exports = EmpleadorEmpresa