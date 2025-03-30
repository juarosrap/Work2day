const mongoose = require('mongoose')
const { model,Schema } = mongoose;

const EmpleadorEmpresaSchema = new Schema({
    nombre: String,
    correo: String,
    telefono: String,
    fotoPerfil: String,
    fechaNacimiento: Date,
    contrasena: String,
    nombreEmpresa: String,
    sector: String,
    ubicacion: String,
    fotoEmpresa: String,
    correoEmpresa: String,
    telefonoEmpresa: String,
    paginaWeb: String,
    ofertas: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Oferta' 
    }],
    valoraciones: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'ValoracionEmpleador' 
    }]
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