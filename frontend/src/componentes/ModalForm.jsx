import { useState } from "react";
import "../styles/ModalForm.css";

export default function ModalForm() {
  const [tipo, setTipo] = useState("candidato");
  const [formData, setFormData] = useState({
    curriculum: {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    
    if (
      [
        "informacionPersonal",
        "ubicacionCurriculum",
        "formacionAcademica",
        "experienciaLaboral",
        "idiomas",
      ].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        curriculum: {
          ...prev.curriculum,
          [name]: name === "idiomas" ? value.split(",") : value, 
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const camposBase = (
    <>
      <div className="row">
        <div>
          <label>Nombre</label>
          <input name="nombre" onChange={handleChange} required />
        </div>
        <div>
          <label>Teléfono</label>
          <input name="telefono" onChange={handleChange} required />
        </div>
      </div>
      <label>Correo</label>
      <input name="correo" type="email" onChange={handleChange} required />
      <label>Fecha de nacimiento</label>
      <input
        name="fechaNacimiento"
        type="date"
        onChange={handleChange}
        required
      />
      <label>Contraseña</label>
      <input
        name="contrasena"
        type="password"
        onChange={handleChange}
        required
      />
      <label>Foto de perfil (URL)</label>
      <input name="fotoPerfil" onChange={handleChange} />
    </>
  );

  const camposEmpresa = tipo === "empleadorEmpresa" && (
    <>
      <label>Nombre de la empresa</label>
      <input name="nombreEmpresa" onChange={handleChange} required />
      <label>Sector</label>
      <input name="sector" onChange={handleChange} required />
      <label>Ubicación</label>
      <input name="ubicacion" onChange={handleChange} />
      <label>Foto de empresa (URL)</label>
      <input name="fotoEmpresa" onChange={handleChange} />
      <label>Correo de empresa</label>
      <input
        name="correoEmpresa"
        type="email"
        onChange={handleChange}
        required
      />
      <label>Teléfono de empresa</label>
      <input name="telefonoEmpresa" onChange={handleChange} required />
      <label>Página web</label>
      <input name="paginaWeb" onChange={handleChange} />
    </>
  );

  const camposCurriculum = tipo === "candidato" && (
    <>
      <hr />
      <h3 style={{ textAlign: "center" }}>Currículum</h3>
      <label>Información Personal</label>
      <input name="informacionPersonal" onChange={handleChange} />
      <label>Ubicación</label>
      <input name="ubicacionCurriculum" onChange={handleChange} />
      <label>Formación Académica</label>
      <input name="formacionAcademica" onChange={handleChange} />
      <label>Experiencia Laboral</label>
      <input name="experienciaLaboral" onChange={handleChange} />
      <label>Idiomas (separados por coma)</label>
      <input name="idiomas" onChange={handleChange} />
    </>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", { tipo, ...formData });
  };

  return (
    <form className="registro-form" onSubmit={handleSubmit}>
      <label>¿Qué eres?</label>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="candidato">Candidato</option>
        <option value="empleadorParticular">Empleador Particular</option>
        <option value="empleadorEmpresa">Empleador de Empresa</option>
      </select>

      {camposBase}
      {camposEmpresa}
      {camposCurriculum}

      <button type="submit">Enviar</button>
    </form>
  );
}
