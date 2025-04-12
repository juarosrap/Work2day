import { useState } from "react";
import "../styles/ModalForm.css"; 
import "../styles/Modal.css"; 

export default function LoginModal({ onClose }) {
  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Inicio de sesión con:", formData);
    onClose(); 
  };

  return (
    <div className="modal-overlay">
      <div className="registro-form">
        
        <h2 style={{ textAlign: "center" }}>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <label>Correo</label>
          <input type="email" name="correo" onChange={handleChange} required />
          <label>Contraseña</label>
          <input
            type="password"
            name="contrasena"
            onChange={handleChange}
            required
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
