import { useState } from "react";
import "../styles/ModalForm.css"; 

export default function ApplyForm({ onClose }) {
  const [formData, setFormData] = useState({
    correo: "",
    cvUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("CV enviado:", formData);
    // Llamada a API
    onClose(); 
  };

  return (
    <div className="modal-background">
      <div className="modal-container">
        <h2 style={{ textAlign: "center" }}>Aplicar a Oferta</h2>
        <form onSubmit={handleSubmit} className="registro-form">
          <label>Correo</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
          />

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

          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}
