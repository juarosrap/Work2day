import { useState } from "react";
import "../styles/ModalForm.css";
import { useForm } from "react-hook-form";

export default function ModalForm() {
  const {
    register,
    handleSubmit,
    watch, 
    formState: { errors, isSubmitting },
  } = useForm();

  let API = "http://localhost:5000/api/";

  const [apiError, setApiError] = useState("");
  const [tipo, setTipo] = useState("candidato");
  const [formData, setFormData] = useState({
    curriculum: {},
  });

  const password = watch("contrasena"); 

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

  
  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "4px",
    marginBottom: "8px",
  };

  const camposBase = (
    <>
      <div className="row">
        <div>
          <label>Nombre</label>
          <input
            {...register("nombre", { required: "Este campo es obligatorio" })}
          />
          {errors.nombre && <p style={errorStyle}>{errors.nombre.message}</p>}
        </div>
        <div>
          <label>Teléfono</label>
          <input
            {...register("telefono", { required: "Este campo es obligatorio" })}
          />
          {errors.telefono && (
            <p style={errorStyle}>{errors.telefono.message}</p>
          )}
        </div>
      </div>
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

      <label>Fecha de nacimiento</label>
      <input
        {...register("fechaNacimiento", {
          required: "Este campo es obligatorio",
        })}
        type="date"
      />
      {errors.fechaNacimiento && (
        <p style={errorStyle}>{errors.fechaNacimiento.message}</p>
      )}

      <label>Contraseña</label>
      <input
        {...register("contrasena", {
          required: "Este campo es obligatorio",
          minLength: {
            value: 6,
            message: "La contraseña debe tener al menos 6 caracteres",
          },
        })}
        type="password"
      />
      {errors.contrasena && (
        <p style={errorStyle}>{errors.contrasena.message}</p>
      )}

      <label>Confirmar Contraseña</label>
      <input
        {...register("confirmarContrasena", {
          required: "Este campo es obligatorio",
          validate: (value) =>
            value === password || "Las contraseñas no coinciden",
        })}
        type="password"
      />
      {errors.confirmarContrasena && (
        <p style={errorStyle}>{errors.confirmarContrasena.message}</p>
      )}

      <label>Foto de perfil (URL)</label>
      <input {...register("fotoPerfil")} />
    </>
  );

  const camposEmpresa = tipo === "empleadorEmpresa" && (
    <>
      <label>Nombre de la empresa</label>
      <input
        {...register("nombreEmpresa", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.nombreEmpresa && (
        <p style={errorStyle}>{errors.nombreEmpresa.message}</p>
      )}

      <label>Sector</label>
      <input
        {...register("sector", { required: "Este campo es obligatorio" })}
      />
      {errors.sector && <p style={errorStyle}>{errors.sector.message}</p>}

      <label>Ubicación</label>
      <input
        {...register("ubicacion", { required: "Este campo es obligatorio" })}
      />
      {errors.ubicacion && <p style={errorStyle}>{errors.ubicacion.message}</p>}

      <label>Foto de empresa (URL)</label>
      <input {...register("fotoEmpresa")} />

      <label>Correo de empresa</label>
      <input
        {...register("correoEmpresa", {
          required: "Este campo es obligatorio",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Formato de correo inválido",
          },
        })}
        type="email"
      />
      {errors.correoEmpresa && (
        <p style={errorStyle}>{errors.correoEmpresa.message}</p>
      )}

      <label>Teléfono de empresa</label>
      <input
        {...register("telefonoEmpresa", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.telefonoEmpresa && (
        <p style={errorStyle}>{errors.telefonoEmpresa.message}</p>
      )}

      <label>Página web</label>
      <input
        {...register("paginaWeb", { required: "Este campo es obligatorio" })}
      />
      {errors.paginaWeb && <p style={errorStyle}>{errors.paginaWeb.message}</p>}
    </>
  );

  const camposCurriculum = tipo === "candidato" && (
    <>
      <hr />
      <h3 style={{ textAlign: "center" }}>Currículum</h3>
      <label>Información Personal</label>
      <input
        {...register("informacionPersonal", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.informacionPersonal && (
        <p style={errorStyle}>{errors.informacionPersonal.message}</p>
      )}

      <label>Ubicación</label>
      <input
        {...register("ubicacionCurriculum", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.ubicacionCurriculum && (
        <p style={errorStyle}>{errors.ubicacionCurriculum.message}</p>
      )}

      <label>Formación Académica</label>
      <input
        {...register("formacionAcademica", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.formacionAcademica && (
        <p style={errorStyle}>{errors.formacionAcademica.message}</p>
      )}

      <label>Experiencia Laboral</label>
      <input
        {...register("experienciaLaboral", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.experienciaLaboral && (
        <p style={errorStyle}>{errors.experienciaLaboral.message}</p>
      )}

      <label>Idiomas (separados por coma)</label>
      <input
        {...register("idiomas", { required: "Este campo es obligatorio" })}
      />
      {errors.idiomas && <p style={errorStyle}>{errors.idiomas.message}</p>}
    </>
  );

  const onSubmit = async (data) => {
    if (data.tipo === "candidato") {
      API = "http://localhost:5000/api/candidatos/register";
    } else if (data.tipo === "empleadorParticular") {
      API = "http://localhost:5000/api/empleadores-particular/register";
    } else {
      API = "http://localhost:5000/api/empleadores-empresa/register";
    }
    console.log(data);
    console.log(data.contrasena);
    console.log(API);
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          
          if (errorData.message) {
            setApiError(errorData.message);
          } else if (errorData.errors) {
              const errorMessages = Object.values(errorData.errors).join(", ");
              setApiError(`Datos inválidos: ${errorMessages}`);
          } else {
            setApiError("Los datos enviados son incorrectos. Por favor revisa el formulario.");
          }
        }
      }
      const responseData = await response.json();
      console.log("Registro exitoso:", responseData);
    } catch (e) {
        console.error("Error:", error);
        setApiError("Error de conexión. Por favor verifica tu conexión a internet.");
        return false;
    }
  };

  return (
    <form className="registro-form" onSubmit={handleSubmit(onSubmit)}>
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
      {errors.tipo && <p style={errorStyle}>{errors.tipo.message}</p>}

      {camposBase}
      {camposEmpresa}
      {camposCurriculum}

      {apiError && (
        <div
          style={{
            color: "white",
            backgroundColor: "red",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px",
          }}
        >
          {apiError}
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
