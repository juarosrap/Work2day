import "../styles/DashBoard.css"

export default function DashBoardRow({ job }) {
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
          8
        </div>
        <div className="cell" data-label="FECHA">
          20/03/2025
        </div>
        <div className="cell actions" data-label="ACCIONES">
          <span className="edit">Editar</span>
          <span className="delete">Eliminar</span>
        </div>
      </div>
    );
}