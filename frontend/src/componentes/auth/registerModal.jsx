import { useState } from "react";
import "../../styles/ModalForm.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";

export default function registerModal() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  

  const [apiError, setApiError] = useState("");
  const [tipo, setTipo] = useState("candidato");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const password = watch("contrasena");

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

      <label>Foto de perfil</label>
      <input type="file" accept="image/*" {...register("fotoPerfil")} />
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

      <label>Foto de empresa</label>
      <input type="file" accept="image/*" {...register("fotoEmpresa")} />

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

      <label>Idiomas (separados por coma)</label>
      <input
        {...register("idiomasRaw", { required: "Este campo es obligatorio" })}
      />
      {errors.idiomasRaw && (
        <p style={errorStyle}>{errors.idiomasRaw.message}</p>
      )}

      <h3>Experiencia Laboral</h3>

      <label>Empresa</label>
      <input {...register("empresa")} placeholder="Nombre de la empresa" />

      <label>Puesto</label>
      <input {...register("puesto")} placeholder="Tu puesto en la empresa" />

      <label>Fecha de Inicio</label>
      <input {...register("fechaInicio")} type="date" />

      <label>Fecha de Fin</label>
      <input {...register("fechaFin")} type="date" />

      <label>Descripción</label>
      <textarea
        {...register("descripcion")}
        placeholder="Describe tus tareas o logros"
      />
    </>
  );

  const onSubmit = async (data) => {
    try {
      // Preparar los datos según el tipo de usuario
      let endpoint = "";
      const formData = new FormData();

      // Añadir datos comunes
      formData.append("tipo", data.tipo);
      formData.append("nombre", data.nombre);
      formData.append("telefono", data.telefono);
      formData.append("correo", data.correo);
      formData.append("fechaNacimiento", data.fechaNacimiento);
      formData.append("contrasena", data.contrasena);

      if (data.fotoPerfil && data.fotoPerfil[0]) {
        formData.append("fotoPerfil", data.fotoPerfil[0]);
      }

      if (data.tipo === "candidato") {
        endpoint = "candidato/register";

        // Preparar el curriculum como un objeto separado
        const curriculum = {
          informacionPersonal: data.informacionPersonal,
          ubicacion: data.ubicacionCurriculum,
          formacionAcademica: data.formacionAcademica,
        };

        // Procesar idiomas
        if (data.idiomasRaw) {
          curriculum.idiomas = data.idiomasRaw
            .split(",")
            .map((idioma) => idioma.trim())
            .filter((idioma) => idioma !== "");
        }

        
        if (data.empresa && data.empresa.trim() !== "") {
          curriculum.experienciaPrevia = [
            {
              empresa: data.empresa,
              puesto: data.puesto || "",
              fechaInicio: data.fechaInicio || null,
              fechaFin: data.fechaFin || null,
              descripcion: data.descripcion || "",
            },
          ];
        }

        // Añadir cada campo del curriculum por separado
        formData.append("informacionPersonal", curriculum.informacionPersonal);
        formData.append("ubicacionCurriculum", curriculum.ubicacion);
        formData.append("formacionAcademica", curriculum.formacionAcademica);

        // Añadir idiomas como un array
        if (curriculum.idiomas && curriculum.idiomas.length > 0) {
          formData.append("idiomas", JSON.stringify(curriculum.idiomas));
        }

        // Añadir experiencia previa si existe
        if (
          curriculum.experienciaPrevia &&
          curriculum.experienciaPrevia.length > 0
        ) {
          formData.append(
            "experienciaPrevia",
            JSON.stringify(curriculum.experienciaPrevia)
          );
        }

        formData.append("curriculumCompleto", JSON.stringify(curriculum));

        console.log("Curriculum enviado:", curriculum);
      } else if (data.tipo === "empleadorParticular") {
        endpoint = "empleadorParticular/register";
      } else {
        endpoint = "empleadorEmpresa/register";

        formData.append("nombreEmpresa", data.nombreEmpresa);
        formData.append("sector", data.sector);
        formData.append("ubicacion", data.ubicacion);
        formData.append("correoEmpresa", data.correoEmpresa);
        formData.append("telefonoEmpresa", data.telefonoEmpresa);
        formData.append("paginaWeb", data.paginaWeb);

        if (data.fotoEmpresa && data.fotoEmpresa[0]) {
          formData.append("fotoEmpresa", data.fotoEmpresa[0]);
        }
      }

      
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      
      const response = await apiFetch(`/${endpoint}`, {
        method: "POST",
        body: formData,
      });
      

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(errorData?.error || "Error del servidor");
        console.error("Error response:", errorData);
        return;
      }

      const responseData = await response.json();
      

      setApiError("");
      setSuccessMessage("Registro exitoso. ¡Bienvenido!");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (e) {
      console.error("Error en la solicitud:", e);
      setApiError(
        "Error de conexión. Por favor verifica tu conexión a internet."
      );
    }
  };

  return (
    <form
      className="registro-form"
      onSubmit={handleSubmit(onSubmit)}
      encType="multipart/form-data"
    >
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

      {(apiError || successMessage) && (
        <div
          style={{
            color: "white",
            backgroundColor: apiError ? "red" : "green",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {apiError || successMessage}
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
