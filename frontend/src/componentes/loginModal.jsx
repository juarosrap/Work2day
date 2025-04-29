import { useState } from "react";
import "../styles/ModalForm.css";
import "../styles/Modal.css";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 

export default function LoginModal() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [tipo, setTipo] = useState("candidato");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const { login, error: authError } = useAuth(); 

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "4px",
    marginBottom: "8px",
  };

  const onSubmit = async (data) => {
    const tipo = data.tipo;
    const { tipo: _, ...credentials } = data;

    const success = await login(credentials, tipo);

    if (success) {
      setSuccessMessage("Login exitoso. ¡Bienvenido!");

      // console.log(data)
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="registro-form">
        <h2 style={{ textAlign: "center" }}>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>¿Qué eres?</label>
          <select
            {...register("tipo", { required: "Este campo es obligatorio" })}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="candidato">Candidato</option>
            <option value="empleadorParticular">Empleador Particular</option>
            <option value="empleadorEmpresa">Empleador de Empresa</option>
          </select>
          <label>Correo</label>
          <input
            {...register("correo", {
              required: "Este campo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Formato de correo inválido",
              },
            })}
            type="email"
          />
          {errors.correo && <p style={errorStyle}>{errors.correo.message}</p>}
          <label>Contraseña</label>
          <input
            {...register("contrasena", {
              required: "La contraseña es obligatoria",
            })}
            type="password"
          />
          <Link to="/forgetPassword"><p>¿Has olvidado la contraseña?</p></Link>
          {errors.contrasena && (
            <p style={errorStyle}>{errors.contrasena.message}</p>
          )}
          {errors.tipo && <p style={errorStyle}>{errors.tipo.message}</p>}

          {(authError || successMessage) && (
            <div
              style={{
                color: "white",
                backgroundColor: authError ? "red" : "green",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "15px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {authError || successMessage}
            </div>
          )}
          <button type="submit" disabled={isSubmitting}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
