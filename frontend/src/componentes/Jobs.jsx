import { useContext, useEffect, useState } from "react";
import "../styles/jobs.css";
import JobCard from "./JobCard.jsx";
import { FiltersContext } from "../contexts/FiltersContext.jsx";
import { motion } from "framer-motion";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { filters, setFilters } = useContext(FiltersContext);

  // Añadimos estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(4); // Número de trabajos por página

  const hasActiveFilters =
    filters.titulo ||
    filters.ubicacion ||
    filters.sector ||
    (filters.salario && filters.salario > 0);

  let API = "http://localhost:5000/api/busqueda/ofertas";

  const fetchJobsWithFilters = async (filterParams = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filterParams.titulo) params.append("titulo", filterParams.titulo);
      if (filterParams.ubicacion)
        params.append("ubicacion", filterParams.ubicacion);
      if (filterParams.sector) params.append("sector", filterParams.sector);
      if (filterParams.salario && filterParams.salario > 0)
        params.append("salario", filterParams.salario);

      const response = await fetch(`${API}?${params.toString()}`, {
        credentials: "include",
      });
      const data = await response.json();
      setJobs(data);
      setCurrentPage(1); // Volver a la primera página cuando se aplican filtros
    } catch (error) {
      console.error("Error al obtener trabajos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasActiveFilters) {
      fetchJobsWithFilters();
    } else {
      const fetchJobs = async () => {
        setLoading(true);
        try {
          const response = await fetch(API, {
            credentials: "include",
          });
          const data = await response.json();
          setJobs(data);
        } catch (error) {
          console.error("Error al obtener trabajos:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchJobs();
    }
  }, []);

  const handleSalarioChange = (e) => {
    const value = Number(e.target.value);
    setFilters((prev) => ({ ...prev, salario: value }));
  };

  const handleTituloChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, titulo: value }));
  };

  const handleUbicacionChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, ubicacion: value }));
  };

  const handleSectorChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, sector: value }));
  };

  const handleSearch = () => {
    fetchJobsWithFilters();
  };

  // Lógica para la paginación
  const activeJobs = jobs.filter((job) => job.estado === "Activa");
  const totalActiveJobs = activeJobs.length;
  const totalPages = Math.ceil(totalActiveJobs / jobsPerPage);

  // Obtener los trabajos actuales para la página actual
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = activeJobs.slice(indexOfFirstJob, indexOfLastJob);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Ir a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Ir a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="jobs"
    >
      <div className="jobs-top-section">
        <div className="filters">
          <div className="salary-filter">
            <div className="salary-header">
              <label htmlFor="salario">Salario Mínimo</label>
              <span className="salary-value">{filters.salario}€</span>
            </div>
            <input
              type="range"
              min="0"
              max="4000"
              step="50"
              value={filters.salario || 0}
              onChange={handleSalarioChange}
              id="salario"
              className="salary-slider"
            />
          </div>

          <label htmlFor="sector">Sector profesional</label>
          <select
            id="sector"
            name="sector"
            value={filters.sector || ""}
            onChange={handleSectorChange}
          >
            <option value="">Todos los sectores</option>
            <option value="Hosteleria">Hostelería</option>
            <option value="Domestico">Doméstico</option>
            <option value="Obra">Obra</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="title">
          <h1>Search for Jobs</h1>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          value={filters.titulo || ""}
          onChange={handleTituloChange}
          placeholder="Search a job"
        />
        <input
          type="text"
          value={filters.ubicacion || ""}
          onChange={handleUbicacionChange}
          placeholder="Where"
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="cards">
        {loading ? (
          <p>Cargando trabajos...</p>
        ) : currentJobs.length === 0 ? (
          <p>No hay trabajos activos.</p>
        ) : (
          currentJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>

      {/* Componente de paginación */}
      {!loading && totalActiveJobs > 0 && (
        <div className="pagination">
          {/* Botón anterior - aseguramos que SIEMPRE use pagination-button */}
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`pagination-button ${
              currentPage === 1 ? "disabled" : ""
            }`}
          >
            &laquo; Anterior
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => {
              // Mostrar siempre la primera página, la última, la actual y una página antes y después de la actual
              const pageNumber = i + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    // Aseguramos de usar solo pagination-number para los números
                    className={`pagination-number ${
                      currentPage === pageNumber ? "active" : ""
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                (pageNumber === 2 && currentPage > 3) ||
                (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span key={pageNumber} className="pagination-ellipsis">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>
          
          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`pagination-button ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            Siguiente &raquo;
          </button>

          <div className="pagination-info">
            Página {currentPage} de {totalPages} ({totalActiveJobs} trabajos)
          </div>
        </div>
      )}
    </motion.div>
  );
}
