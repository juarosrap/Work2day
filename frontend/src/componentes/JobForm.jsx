import "../styles/ModalForm.css";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";


export default function JobForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
      } = useForm();

    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [apiError, setApiError] = useState("");
    const [estado, setEstado] = useState("Activa");
    const [successMessage, setSuccessMessage] = useState("");

    const onSubmit = async (data) => {
        let API = "http://localhost:5000/api/ofertas";

        const job = { ...data, empleadorId: currentUser.id }

        if (job.requisitosRaw) {
          const requisitosArray = job.requisitosRaw
            .split(",")
            .map((requisito) => requisito.trim())
            .filter((requisito) => requisito !== "");

          job.requisitos = requisitosArray;
        }

        delete job.requisitosRaw;

        try {
            console.log(job);
            const response = await fetch(API, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(job),
            });

            if (!response.ok) {
              if (response.status === 400) {
                const errorData = await response.json();
                if (errorData.error) {
                  setApiError(errorData.error);
                }
              } else {
                setApiError(`Error del servidor (${response.status})`);
              }
              return;
            }

            setApiError("");
            setSuccessMessage("Oferta creada con exito.");
            setTimeout(() => {
              navigate(`/dashboard/${currentUser.id}`);
            }, 3000);


        } catch (e) {
            console.error("Error:", e);
            setApiError(
              "Error de conexión. Por favor verifica tu conexión a internet."
            );
        }
    }

    return (
      <div className="modal-background">
        <div className="modal-container">
          <h2 style={{ textAlign: "center" }}>Publicar nueva Oferta</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
            <label>Título</label>
            <input
              {...register("titulo", {
                required: "Este campo es obligatorio",
              })}
              type="text"
            />

            <label>Descripción</label>
            <input
              {...register("descripcion", {
                required: "Este campo es obligatorio",
              })}
            />

            <label>Ubicación</label>
            <input
              {...register("ubicacion", {
                required: "Este campo es obligatorio",
              })}
            />

            <label>Salario</label>
            <input
              {...register("salario", {
                required: "Este campo es obligatorio",
              })}
              type="numer"
            />

            <label>Imagen</label>
            <input {...register("imagen")} />

            <label>requisitos (separados por coma)</label>
            <input
              {...register("requisitos", {
                required: "Este campo es obligatorio",
              })}
            />

            <label>Duración</label>
            <input
              {...register("duracion", {
                required: "Este campo es obligatorio",
              })}
              type="text"
            />

            <label>Estado</label>
            <select
              {...register("estado", { required: "Este campo es obligatorio" })}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="Activa">Activa</option>
              <option value="Pausada">Pausada</option>
              <option value="Expirada">Expirada</option>
              <option value="Retrirada">Retirada</option>
            </select>

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

            <button type="submit">
              {isSubmitting ? "Creando..." : "Crear"}
            </button>
          </form>
        </div>
      </div>
    );
}