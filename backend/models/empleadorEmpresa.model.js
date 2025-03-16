const mongoose = require('mongoose')
const { model,Schema } = mongoose;

const EmpleadorEmpresaSchema = new Schema({
    nombre: String,
    correo: String,
    telefono: String,
    fotoPerfil: String,
    fechaNacimiento: Date,
    contraseña: String,
    nombreEmpresa: String,
    sector: String,
    ubicacion: String,
    fotoEmpresa: String,
    correoEmpresa: String,
    telefonoEmpresa: String,
    paginaWeb: String,
    ofertas: [{ type: Schema.Types.ObjectId, ref: 'Oferta' }],
    valoraciones: [{ type: Schema.Types.ObjectId, ref: 'ValoracionEmpleador' }]
});

const EmpleadorEmpresa = model('EmpleadorEmpresa', EmpleadorEmpresaSchema);
module.exports = EmpleadorEmpresa