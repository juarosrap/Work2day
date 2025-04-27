import "../styles/DashBoard.css";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashBoardRow({ job }) {
  const { currentUser } = useAuth();

  
  const getStatusClass = (estado) => {
    switch (estado.toLowerCase()) {
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
        20/03/2025
      </div>
      <div className="cell actions" data-label="ACCIONES">
        <span className="edit">
          <Link to={`/dashboard/${currentUser.id}/edit/${job.id}`}>Editar</Link>
        </span>
        <span className="delete">
          <Link to={`/dashboard/${currentUser.id}/delete/${job.id}`}>
            Eliminar
          </Link>
        </span>
      </div>
    </div>
  );
}
