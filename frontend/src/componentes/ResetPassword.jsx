import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import "../styles/forgetModal.css"; 

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      
      if (!token) {
        setError("Token inválido o faltante");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: data.newPassword }),
      });

      if (response.ok) {
        setSuccessMessage("Contraseña actualizada con éxito");
        
        setTimeout(() => {
          navigate("/");
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

  const password = watch("newPassword", "");

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
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              className="form-input"
              type="password"
              {...register("newPassword", {
                required: "La contraseña es obligatoria",
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              className="form-input"
              type="password"
              {...register("confirmPassword", {
                required: "Debe confirmar la contraseña",
                validate: (value) =>
                  value === password || "Las contraseñas no coinciden",
              })}
            />
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword.message}</p>
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
              onClick={() => navigate("/")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
