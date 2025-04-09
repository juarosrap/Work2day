import "../styles/JobCard.css";
import calendar from "../assets/calendar-icon.svg";

export default function Job(){
    return (
      <div className="job-card">
        <div className="job-image">

        </div>
        <div className="job-content">
          <div className="job-meta">
            <span className="job-date">
                <img className="icon"src={calendar} alt="calendario"/> 10/03/2025
            </span>
            <span className="job-city">Sevilla</span>
            <span className="job-company">US</span>
          </div>
          <h3 className="job-title">Camarero</h3>
          <p className="job-description">Se busca camarero a media jornada en el restaurante
            el parlanchin.
          </p>
          <div className="job-actions">
            <a href="#" className="read-more">
              Read more
            </a>
            <button className="apply-btn">Apply</button>
          </div>
        </div>
      </div>
    );
}