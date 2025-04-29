import "../styles/ModalForm.css";
import { useEffect, useState } from "react";
import { useForm,useWatch } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

export default function JobForm() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();


  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id, ofertaId } = useParams();

  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [estado, setEstado] = useState("Activa");
  const [sector, setSector] = useState("Otro");

  const isEditMode = Boolean(ofertaId);

  useEffect(() => {
    const fechaInicio = watch("fechaInicio");
    const fechaFin = watch("fechaFin");

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      if (!isNaN(inicio) && !isNaN(fin)) {
        const diffTime = fin - inicio;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setValue("duracion", diffDays >= 0 ? `${diffDays} días` : "0 días");
      }
    }
  }, [watch("fechaInicio"), watch("fechaFin"), setValue]);


  
  useEffect(() => {
    if (!isEditMode) return;

    const fetchOferta = async () => {
      try {
        let API = `http://localhost:5000/api/ofertas/${ofertaId}`;
        const res = await fetch(API);
        
        if (!res.ok) throw new Error("No se pudo obtener la oferta");
        const data = await res.json();

        const formatDate = (isoString) => isoString ? isoString.slice(0, 10) : "";


        console.log("Datos recibidos:", data); 

        reset({
          titulo: data.titulo || "",
          descripcion: data.descripcion || "",
          ubicacion: data.ubicacion || "",
          salario: data.salario || "",
          imagen: data.imagen || "",
          requisitos: data.requisitos?.join(", ") || "",
          fechaInicio: formatDate(data.fechaInicio),
          fechaFin: formatDate(data.fechaFin),
          duracion: data.duracion || "",
          estado: data.estado || "Activa",
          sector: data.sector || "Otro",
        });

        setEstado(data.estado || "Activa");
        setSector(data.sector || "Otro");
      } catch (error) {
        console.error(error);
        setApiError("Error al cargar la oferta para editar.");
      }
    };

    fetchOferta();
  }, [isEditMode, ofertaId, reset]);


  const onSubmit = async (data) => {
    const job = {
      ...data,
      empleadorId: currentUser.id,
      requisitos: data.requisitos
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r),
    };

    const API = isEditMode
      ? `http://localhost:5000/api/ofertas/${ofertaId}`
      : "http://localhost:5000/api/ofertas";

    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(API, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          setApiError(errorData.error || "Datos inválidos");
        } else {
          throw new Error("Error en el servidor");
        }
        return;
      }

      setApiError("");
      setSuccessMessage(
        isEditMode
          ? "Oferta actualizada con éxito."
          : "Oferta creada con éxito."
      );

      setTimeout(() => {
        navigate(`/dashboard/${currentUser.id}`);
      }, 3000);
    } catch (e) {
      console.error("Error:", e);
      setApiError(
        "Error de conexión. Por favor verifica tu conexión a internet."
      );
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-container">
        <h2 style={{ textAlign: "center" }}>
          {isEditMode ? "Editar Oferta" : "Publicar nueva Oferta"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
          <label>Título</label>
          <input
            {...register("titulo", { required: "Este campo es obligatorio" })}
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
            {...register("salario", { required: "Este campo es obligatorio" })}
            type="number"
          />

          <label>Imagen</label>
          <input {...register("imagen")} />

          <label>Fecha de Inicio</label>
          <input
            {...register("fechaInicio", {
              required: "Este campo es obligatorio",
            })}
            type="date"
          />

          <label>Fecha de Finalización</label>
          <input
            {...register("fechaFin", {
              required: "Este campo es obligatorio",
            })}
            type="date"
          />

          <label>Requisitos (separados por coma)</label>
          <input
            {...register("requisitos", {
              required: "Este campo es obligatorio",
            })}
          />

          <label>Duración</label>
          <input
            {...register("duracion", { required: "Este campo es obligatorio" })}
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
            <option value="Retirada">Retirada</option>
          </select>

          <label>Sector</label>
          <select
            {...register("sector", { required: "Este campo es obligatorio" })}
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          >
            <option value="Hosteleria">Hosteleria</option>
            <option value="Domestico">Domestico</option>
            <option value="Obra">Obra</option>
            <option value="Otro">Otro</option>
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
            {isSubmitting
              ? isEditMode
                ? "Actualizando..."
                : "Creando..."
              : isEditMode
              ? "Actualizar"
              : "Crear"}
          </button>
        </form>
      </div>
    </div>
  );
}
