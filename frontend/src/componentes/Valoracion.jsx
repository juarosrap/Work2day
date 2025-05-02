import "../styles/forgetModal.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";

export default function Valoracion() {
    const { valorado } = useParams()
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const { currentUser } = useAuth();

    const {
            register,
            handleSubmit,
            formState: { errors, isSubmitting },
        } = useForm();

    const onSubmit = async (data) => {
      try {
        if (!currentUser) {
          navigate("/");
          return;
        }

        if (currentUser.userType === "Candidato") {
            let API = `http://localhost:5000/api/valoraciones-empleador/empleador/`;
        }
        

        const response = await fetch(API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            correo: currentUser.correo,
          }),
        });

        if (response.ok) {
          setSuccessMessage("Contraseña actualizada con éxito");

          setTimeout(() => {
            window.history.back();
          }, 2000);
        } else {
          const errorData = await response.json();
          setError(
            errorData.message ||
              "Ha ocurrido un error al restablecer la contraseña"
          );
        }
      } catch (err) {
        setError("Error de conexión. Inténtelo de nuevo más tarde.");
      }
    };

    return (
      <div className="modal-background">
        <div className="modal-container">
          {/* <h2>Valora al ${currentUser.user}</h2> */}

          {(error || successMessage) && (
            <div className={`status-message ${error ? "error" : "success"}`}>
              {error ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  {error}
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  {successMessage}
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="form-container">
            <div className="form-group-modal">
              <label htmlFor="puntuacion" className="form-label">
                Puntuación
              </label>
              <input
                id="puntuacion"
                className="form-input"
                type="number"
                {...register("puntuacion", {
                  required: "La puntuacion es obligatoria",
                  maxLength: 2
                })}
              />
              {errors.puntuacion && (
                <p className="error-message">{errors.puntuacion.message}</p>
              )}
            </div>

            <div className="form-group-modal">
              <label htmlFor="Comentario" className="form-label">
                Comentario
              </label>
              <input
                id="Comentario"
                className="form-input"
                type="text"
                {...register("Comentario", {
                  required: "El Comentario es obligatoria",
                })}
              />
              {errors.Comentario && (
                <p className="error-message">{errors.Comentario.message}</p>
              )}
            </div>

            <div className="button-group">
              <button
                type="submit"
                className="delete-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Procesando..." : "Restablecer contraseña"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => window.history.back()}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}