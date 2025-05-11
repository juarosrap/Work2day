import React from "react";
import { User, Briefcase, Star } from "lucide-react";
import { motion } from "framer-motion";
import "../../styles/AboutUs.css";

const AboutUs = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="about-container"
    >
      <h1 className="about-title">Sobre Nosotros</h1>
      <p className="about-text">
        Bienvenido a nuestro portal de empleos temporales y no cualificados. Soy
        Juan Ros, y este proyecto personal nace como mi Trabajo de Fin de Grado
        para facilitar la conexión entre empresas y trabajadores.
      </p>

      

      <div className="about-grid">
        <div className="about-card">
          <Briefcase size={32} className="about-icon blue" />
          <h2 className="about-card-title">Empleos Temporales</h2>
          <p className="about-card-text">
            Explora una amplia variedad de ofertas de trabajo temporales en tu
            zona.
          </p>
        </div>

        <div className="about-card">
          <User size={32} className="about-icon green" />
          <h2 className="about-card-title">Diseño Intuitivo</h2>
          <p className="about-card-text">
            Plataforma sencilla y accesible para que encuentres empleo sin
            complicaciones.
          </p>
        </div>

        <div className="about-card">
          <Star size={32} className="about-icon yellow" />
          <h2 className="about-card-title">Soporte 24/7</h2>
          <p className="about-card-text">
            Nuestro equipo está disponible para ayudarte en lo que necesites.
          </p>
        </div>
      </div>

      <div className="about-founder">
        <h2 className="about-founder-title">Fundador</h2>
        <p className="about-founder-text">Juan Ros - Desarrollador Web</p>
        <button className="about-button">Contáctame</button>
      </div>
    </motion.div>
  );
};

export default AboutUs;
