import "../../styles/ModalForm.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { apiFetch } from "../../api";

export default function DeleteJob() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async () => {
    try {
      const response = await apiFetch(
        `/api/${currentUser.userType}/${currentUser.id}`,
        {
          method: "DELETE",
        }
      );      

      if (!response.ok) {
        setError("Error eliminando la cuenta");
        return;
      }

      logout();
      setError("");
      setSuccessMessage("Cuenta eliminada correctamente.");


      setTimeout(() => {
        navigate(`/`);
      }, 1000);
    } catch (e) {
      console.error("Error:", e);
      setError("Error de conexión. Por favor verifica tu conexión a internet.");
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-container">
        <h2 style={{ textAlign: "center" }}>¿Desea eliminar la Cuenta?</h2>

        {(error || successMessage) && (
          <div
            style={{
              color: "white",
              backgroundColor: error ? "red" : "green",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {error || successMessage}
          </div>
        )}

        <button className="delete-btn" onClick={onSubmit}>
          Sí
        </button>
        <button
          className="cancel-btn"
          onClick={() => window.history.back()}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
