import "../styles/DashBoard.css";

export default function DashBoard() {
  return (
    <div className="main-dash">
      <div className="title-dash">
        <h2>Dashboard</h2>
        <button className="add-job">+ Nueva oferta de trabajo</button>
      </div>

      <div className="statistics-dash">
        <div className="stat-card">
          <p>Ofertas activas</p>
          <p className="active">12</p>
        </div>
        <div className="stat-card">
          <p>Candidatos totales</p>
          <p className="total">12</p>
        </div>
        <div className="stat-card">
          <p>Puestos cubiertos</p>
          <p className="filled">12</p>
        </div>
      </div>

        <div className="data-dash">
            <h2>Mis ofertas publicadas</h2>
            <div className="search-dash">
                <input placeholder="Buscar ofertas..." />
            </div>

            <div className="job-table">
                <div className="table-header">
                    <div className="header-cell">TÍTULO</div>
                    <div className="header-cell">ESTADO</div>
                    <div className="header-cell">CANDIDATOS</div>
                    <div className="header-cell">FECHA</div>
                    <div className="header-cell">ACCIONES</div>
                </div>

                <div className="table-row">
                    <div className="cell" data-label="TÍTULO">
                        <p>Camarero para eventos</p>
                        <span className="subtitle">Madrid, España</span>
                    </div>
                    <div className="cell" data-label="ESTADO">
                        <span className="status active">Activa</span>
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

                <div className="table-row">
                    <div className="cell" data-label="TÍTULO">
                        <p>Vigilante y organizador</p>
                        <span className="subtitle">Sevilla, España</span>
                    </div>
                    <div className="cell" data-label="ESTADO">
                        <span className="status paused">Pausada</span>
                    </div>
                    <div className="cell" data-label="CANDIDATOS">
                        12
                    </div>
                    <div className="cell" data-label="FECHA">
                        15/01/2025
                    </div>
                    <div className="cell actions" data-label="ACCIONES">
                        <span className="edit">Editar</span>
                        <span className="delete">Eliminar</span>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
  );
}
