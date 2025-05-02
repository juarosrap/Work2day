import "../styles/DashBoard.css";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function DashBoardRow({ data, type, onRemoved }) {
  const { currentUser } = useAuth();
  const [aplicaciones, setAplicaciones] = useState(null);
  const [loading, setLoading] = useState(type === "aplicacion");

  const getAplicacion = async () => {
    setLoading(true);
    try {
      let API = "http://localhost:5000/api/ofertas/";
      const response = await fetch(`${API}${data.ofertaId}`);

      if (!response.ok) {
        throw new Error(`Error al obtener la oferta ${data.ofertaId}`);
      }

      const ofertaData = await response.json();
      setAplicaciones(ofertaData);
      setLoading(false);
      // console.log(aplicaciones)
      return {
        ...data,
        oferta: ofertaData,
      };
    } catch (err) {
      console.error(`Error al obtener ofertas`, err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type === "aplicacion") {
      getAplicacion();
    }
  }, [data, type]);

  const getStatusClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case "activa":
        return "active";
      case "pausada":
        return "paused";
      case "retirada":
      case "expirada":
        return "expired";
      default:
        return "";
    }
  };

  const onDelete = async () => {
    try {
      console.log(data)
      let API = "http://localhost:5000/api/aplicaciones/";
      const response = await fetch(`${API}${data.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Error al eliminar la aplicacion ${data.id}`);
      }

      if (onRemoved) onRemoved(data.id);
      
    } catch(err) {
      console.error("Error:", err);
    }
  }

  if (loading) {
    return (
      <div className="table-row loading">
        <div className="cell" colSpan="5">
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  const renderJobRow = () => {
    const job = data;
    console.log(job.aplicaciones)
    const tiempoRestante = new Date(job.fechaFin) - Date.now();
    return (
      <div className="table-row">
        <div className="cell" data-label="TÍTULO">
          <p>{job.titulo}</p>
          <span className="subtitle">{job.ubicacion}</span>
        </div>
        <div className="cell" data-label="ESTADO">
          <span className={`status ${getStatusClass(job.estado)}`}>
            {job.estado}
          </span>
        </div>
        <div className="cell" data-label="CANDIDATOS">
          <Link to={`candidatos/${job.id}`}>{job.aplicaciones.length}</Link>
        </div>
        <div className="cell" data-label="FECHA">
          {dayjs(job.fechaPublicacion).format("DD/MM/YYYY")}
        </div>
        <div className="cell actions" data-label="ACCIONES">
          {job.estado === "Activa" ? (
            <>
              <span className="edit">
                <Link to={`/dashboard/${currentUser.id}/edit/${job.id}`}>
                  Editar
                </Link>
              </span>
              <span className="delete">
                <Link to={`/dashboard/${currentUser.id}/delete/${job.id}`}>
                  Eliminar
                </Link>
              </span>
            </>
          ) : tiempoRestante > 0 ? (
            `Podrás valorar al candidato en ${Math.ceil(
              tiempoRestante / (1000 * 60 * 60 * 24)
            )} días`
          ) : (
            <Link to={`candidatos/${job.id}`}>
              Ya puedes valorar al candidato
            </Link>
          )}
        </div>
      </div>
    );
  };

  const renderAplicacionRow = () => {
  
    if (!aplicaciones) {
      return null;
    }
    console.log(aplicaciones)

    const tiempoRestante = new Date(aplicaciones.fechaFin) - Date.now();

    return (
      <div className="table-row">
        <div className="cell" data-label="TÍTULO">
          <p>{aplicaciones?.titulo || "N/A"}</p>
          <span className="subtitle">{aplicaciones?.ubicacion || "N/A"}</span>
        </div>
        <div className="cell" data-label="ESTADO">
          <span className="view">
            {data.seleccionado
              ? "Seleccionado"
              : aplicaciones.estado === "Pausada"
              ? "No seleccionado"
              : "En espera de selección"}
          </span>
        </div>
        <div className="cell" data-label="EMPRESA">
          <p>
            {aplicaciones.empleador?.nombreEmpresa ||
              aplicaciones.empleador?.nombre ||
              "N/A"}
          </p>
        </div>
        <div className="cell" data-label="FECHA">
          {dayjs(data.fecha).format("DD/MM/YYYY")}
        </div>
        <div className="cell actions" data-label="ACCIONES">
          {data.seleccionado && tiempoRestante > 0 ? (
            `Podrás valorar al empleador en ${Math.ceil(
              tiempoRestante / (1000 * 60 * 60 * 24)
            )} días`
          ) : data.seleccionado && tiempoRestante < 0 ? (
            <Link
              to={`/dashboard/${currentUser.id}/valoracion/${aplicaciones.empleador._id}`}
            >
              Valorar al empleador
            </Link>
          ) : (
            <button onClick={onDelete}>Quitar</button>
          )}
        </div>
      </div>
    );
  };

  return type === "job" ? renderJobRow() : renderAplicacionRow();
}
