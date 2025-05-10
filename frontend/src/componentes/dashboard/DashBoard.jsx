import "../styles/DashBoard.css";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashBoardRow from "../DashboardRow";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

export default function DashBoard() {
  const { id } = useParams();
  const [jobs, setJobs] = useState(null);
  const [aplicaciones, setAplicaciones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  const isEmpleador = currentUser
    ? currentUser.userType === "empleadorParticular" ||
      currentUser.userType === "empleadorEmpresa"
    : false;

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const getEmpleadorData = async () => {
      try {
        const API = `http://localhost:5000/api/ofertas/empleador/${id}`;
        const response = await fetch(API);

        if (response.status === 404) {
          setError("El empleador no fue encontrado.");
          return;
        }

        if (!response.ok) {
          throw new Error("Error inesperado en el servidor.");
        }

        const data = await response.json();
        setJobs(data);
      } catch (e) {
        console.error("Error al obtener trabajos:", e);
        setError("Error al cargar los detalles del trabajo.");
      } finally {
        setLoading(false);
      }
    };

    const getCandidatoData = async () => {
      try {
        const API = `http://localhost:5000/api/candidato/${id}`;
        const response = await fetch(API);

        if (response.status === 404) {
          setError("El candidato no fue encontrado.");
          return;
        }

        if (!response.ok) {
          throw new Error("Error inesperado en el servidor.");
        }

        const data = await response.json();
        setAplicaciones(data.aplicaciones);
      } catch (e) {
        console.error("Error al obtener aplicaciones:", e);
        setError("Error al cargar las aplicaciones.");
      } finally {
        setLoading(false);
      }
    };

    if (isEmpleador) {
      getEmpleadorData();
    } else {
      getCandidatoData();
    }
  }, [id, isEmpleador, currentUser]);

  if (!currentUser) {
    return <div>Cargando información del usuario...</div>;
  }

  const numCandidatos = () => {
    let cont = 0;

    if (!jobs) return cont;

    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].aplicaciones && Array.isArray(jobs[i].aplicaciones)) {
        cont += jobs[i].aplicaciones.length;
      }
    }

    return cont;
  };

  const numPuestosCubiertos = () => {
    let cont = 0;

    if (!jobs) return cont;

    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].estado === "Pausada") {
        cont += 1;
      }
    }

    return cont;
  };

  const numOfertasActivas = () => {
    let cont = 0;

    if (!jobs) return cont;

    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].estado === "Activa") {
        cont += 1;
      }
    }

    return cont;
  };

  const paginate = (array) => {
    if (!array) return [];
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return array.slice(indexOfFirstRow, indexOfLastRow);
  };

  const totalPages = (array) => {
    if (!array) return 0;
    return Math.ceil(array.length / rowsPerPage);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const Pagination = ({ totalPages, currentPage, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          &laquo; Anterior
        </button>

        <div className="pagination-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              className={`pagination-number ${
                currentPage === number ? "active" : ""
              }`}
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          ))}
        </div>

        <button
          className="pagination-button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Siguiente &raquo;
        </button>
      </div>
    );
  };

  if (loading) return <div>Cargando...</div>;

  if (error) {
    return (
      <div className="main-detail">
        <h2 style={{ color: "red" }}>{error}</h2>
        <Link to="/jobs">Volver a la lista de trabajos</Link>
      </div>
    );
  }

  const renderEmpleado = () => {
    const paginatedJobs = paginate(jobs);
    const totalJobPages = totalPages(jobs);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="main-dash"
      >
        <div className="title-dash">
          <h2>Dashboard</h2>
          <button className="add-job">
            <Link className="link-addjob" to={`/dashboard/${id}/jobForm`}>
              + Nueva oferta de trabajo
            </Link>
          </button>
        </div>

        <div className="statistics-dash">
          <div className="stat-card">
            <p>Ofertas activas</p>
            <p className="active">{numOfertasActivas()}</p>
          </div>
          <div className="stat-card">
            <p>Candidatos totales</p>
            <p className="total">{numCandidatos()}</p>
          </div>
          <div className="stat-card">
            <p>Puestos cubiertos</p>
            <p className="filled">{numPuestosCubiertos()}</p>
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

            {paginatedJobs &&
              paginatedJobs.map((job) => (
                <DashBoardRow key={job.id} data={job} type="job" />
              ))}
          </div>

          <Pagination
            totalPages={totalJobPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </motion.div>
    );
  };

  const renderCandidato = () => {
    const aplicacionesFiltradas = aplicaciones
      ? aplicaciones.filter((aplicacion) => !aplicacion.valorada)
      : [];
    const paginatedAplicaciones = paginate(aplicacionesFiltradas);
    const totalAplicacionesPages = totalPages(aplicacionesFiltradas);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="main-dash-candidato"
      >
        <div className="title-dash">
          <h2>Dashboard</h2>
        </div>

        <div className="data-dash">
          <h2>Mis aplicaciones realizadas</h2>

          <div className="job-table">
            <div className="table-header">
              <div className="header-cell">TÍTULO</div>
              <div className="header-cell">ESTADO</div>
              <div className="header-cell">EMPRESA</div>
              <div className="header-cell">FECHA APLICACIÓN</div>
              <div className="header-cell">ACCIONES</div>
            </div>

            {paginatedAplicaciones &&
              paginatedAplicaciones.map((aplicacion) => (
                <DashBoardRow
                  key={aplicacion.id}
                  data={aplicacion}
                  type="aplicacion"
                  onRemoved={(id) => {
                    setAplicaciones((prev) =>
                      prev.filter((item) => item.id !== id)
                    );
                  }}
                />
              ))}
          </div>

          <Pagination
            totalPages={totalAplicacionesPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </motion.div>
    );
  };

  return isEmpleador ? renderEmpleado() : renderCandidato();
}
