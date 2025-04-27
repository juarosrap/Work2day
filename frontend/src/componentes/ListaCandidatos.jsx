import { useState, useEffect } from "react";
import "../styles/Modal.css";
import { useParams } from "react-router-dom";
import CurriculumModal from "./CurriculumModal";

export default function ListaCandidatos() {
  const [oferta, setOferta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [selectedCandidato, setSelectedCandidato] = useState(null);
  const [seleccionandoCandidato, setSeleccionandoCandidato] = useState(false);
  const { ofertaId } = useParams();

  let API = `http://localhost:5000/api/ofertas/${ofertaId}`;
  

  useEffect(() => {
    fetchOferta();
  }, [API, ofertaId]);

  
  const fetchOferta = async () => {
    try {
      setLoading(true);

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Error al cargar la oferta");
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);
      setOferta(data);
    } catch (err) {
      console.error("Error al cargar oferta:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verCurriculum = (candidato) => {
    setSelectedCandidato(candidato);
    setCvModalOpen(true);
  };

  
  const cerrarModalCV = () => {
    setCvModalOpen(false);
  };

  const editOferta = async () => {
    try{

        const datosActualizados = {
            estado: "Pausada"
        };
        const response = await fetch(API, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosActualizados),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar oferta");
        }
    } catch (err) {
        console.error("Error al actualizar oferta:", err);
    }
  }

  
  const seleccionarCandidato = async (aplicacionId) => {
    try {
      setSeleccionandoCandidato(true);

      const seleccionarURL = `http://localhost:5000/api/aplicaciones/${aplicacionId}`;

      const fechaActual = new Date().toISOString();

      const datosActualizados = {
        seleccionado: true,
        fechaSeleccion: fechaActual,
      };

      const response = await fetch(seleccionarURL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosActualizados),
      });

      if (!response.ok) {
        throw new Error("Error al seleccionar candidato");
      }
      await editOferta();

      await fetchOferta();

      alert("¡Candidato seleccionado con éxito!");
    } catch (err) {
      console.error("Error al seleccionar candidato:", err);
      alert(`Error al seleccionar candidato: ${err.message}`);
    } finally {
      setSeleccionandoCandidato(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Candidatos para esta oferta
        </h2>

        {loading ? (
          <div className="modal-loading">
            <h3>Cargando...</h3>
          </div>
        ) : error ? (
          <div className="modal-error">
            <h3>Error: {error}</h3>
          </div>
        ) : !oferta ||
          !oferta.aplicaciones ||
          oferta.aplicaciones.length === 0 ? (
          <p style={{ textAlign: "center" }}>
            No hay candidatos para esta oferta todavía.
          </p>
        ) : (
          <div className="candidatos-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th>Curriculum</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {oferta.aplicaciones.map((aplicacion) => {
                  const candidato = aplicacion.candidatoId;
                  return (
                    <tr key={aplicacion._id}>
                      <td>{candidato.nombre}</td>
                      <td>{candidato.correo}</td>
                      <td>
                        <span
                          className={`estado-candidato ${
                            aplicacion.seleccionado
                              ? "seleccionado"
                              : "pendiente"
                          }`}
                        >
                          {aplicacion.seleccionado
                            ? "Seleccionado"
                            : "Pendiente"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="cv-button"
                          onClick={() => verCurriculum(candidato)}
                        >
                          Ver CV
                        </button>
                      </td>
                      <td>
                        {!aplicacion.seleccionado ? (
                          <button
                            className="seleccionar-button"
                            onClick={() => seleccionarCandidato(aplicacion._id)}
                            disabled={seleccionandoCandidato}
                          >
                            {seleccionandoCandidato
                              ? "Procesando..."
                              : "Seleccionar"}
                          </button>
                        ) : (
                          <span className="ya-seleccionado">
                            Seleccionado el{" "}
                            {new Date(
                              aplicacion.fechaSeleccion
                            ).toLocaleDateString("es-ES")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <CurriculumModal
          isOpen={cvModalOpen}
          onClose={cerrarModalCV}
          candidato={selectedCandidato}
        />
      </div>
    </div>
  );
}
