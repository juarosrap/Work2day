import "../../styles/ModalForm.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

export default function DeleteJob() {
    const { ofertaId,id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");


    const onSubmit = async () => {
        let API = `http://localhost:5000/api/ofertas/${ofertaId}`;

        try {
            const response = await fetch(API,{
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                setError("Error eliminando la oferta");
                return;
            }

            setError("");
            setSuccessMessage("Oferta eliminada correctamente.");

            setTimeout(() => {
                navigate(`/dashboard/${id}`);
            },1000);

        } catch (e) {
            console.error("Error:", e);
            setError(
              "Error de conexión. Por favor verifica tu conexión a internet."
            );
        }
    }

    return (
      <div className="modal-background">
        <div className="modal-container">
          <h2 style={{ textAlign: "center" }}>¿Desea eliminar la Oferta?</h2>

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
            onClick={() => navigate(`/dashboard/${currentUser.id}`)}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
    
}