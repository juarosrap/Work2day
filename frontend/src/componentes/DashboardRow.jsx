import "../styles/DashBoard.css"
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashBoardRow({ job }) {
    const { currentUser } = useAuth();

    return (
      <div className="table-row">
        <div className="cell" data-label="TÍTULO">
          <p>{job.titulo}</p>
          <span className="subtitle">{job.ubicacion}</span>
        </div>
        <div className="cell" data-label="ESTADO">
          <span className="status active">{job.estado}</span>
        </div>
        <div className="cell" data-label="CANDIDATOS">
          {job.aplicaciones.length}
        </div>
        <div className="cell" data-label="FECHA">
          20/03/2025
        </div>
        <div className="cell actions" data-label="ACCIONES">
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
        </div>
      </div>
    );
}