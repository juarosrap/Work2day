import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import "../styles/forgetModal.css"; 
import { useAuth } from "../../contexts/AuthContext";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const { currentUser } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm();

    const getTokenFromCookies = () => {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith("access_token=")) {
          return cookie.substring("access_token=".length);
        }
      }
      return null;
    };

    const password = watch("currentPassword");



    const onSubmit = async (data) => {
        
      try {
        if (!currentUser) {
          navigate("/");
          return;
        }

        const token = getTokenFromCookies();

        if (!token) {
          setError(
            "No se encontró el token de autenticación. Por favor, inicie sesión nuevamente."
          );
          setTimeout(() => {
            navigate("/");
          }, 2000);
          return;
        }

        let API = `http://localhost:5000/api/change-password`;

        const response = await fetch(API,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ 
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                correo: currentUser.correo
             }),
          }
        );

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
          <h2>Restablece tu contraseña</h2>

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
              <label htmlFor="currentPassword" className="form-label">
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                className="form-input"
                type="password"
                {...register("currentPassword", {
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres",
                  },
                })}
              />
              {errors.currentPassword && (
                <p className="error-message">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="form-group-modal">
              <label htmlFor="newPassword" className="form-label">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                className="form-input"
                type="password"
                {...register("newPassword", {
                  required: "La contraseña es obligatoria",
                  validate: (value) => value !== password || "La contraseña nueva no puede ser la misma que la actual.",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres",
                  },
                })}
              />
              {errors.newPassword && (
                <p className="error-message">{errors.newPassword.message}</p>
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