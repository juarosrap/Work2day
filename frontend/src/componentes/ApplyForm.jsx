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
    // Aquí podrías hacer una llamada a la API si deseas enviarlo
    onClose(); // cerrar modal después de enviar
  };

  return (
    <div className="modal-background">
      <div className="modal-container">
        <h2 style={{ textAlign: "center" }}>Enviar Currículum</h2>
        <form onSubmit={handleSubmit} className="registro-form">
          <label>Correo</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
          />

          <label>CV (URL o enlace de Drive, PDF, etc.)</label>
          <input
            type="text"
            name="cvUrl"
            value={formData.cvUrl}
            onChange={handleChange}
            required
          />

          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}
