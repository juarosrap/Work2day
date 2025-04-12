import "../styles/FeaturesSection.css";
import job from "../assets/job.svg"
import work from "../assets/work.svg";
import chart from "../assets/chart.svg";

export default function FeaturesSection() {
    return (
      <>
        <div className="feature-top-section">
          <h1>It's Easy</h1>
          <p>
            To provide a comprehensive and user-friendly platform <br />
            connecting job seekers with temporary employment <br />
            opportunities across various industries.
          </p>
        </div>
        <div className="feature-bottom-section">
          <div className="card">
            <div className="icon">
              <img src={work} alt="Icon" />
            </div>
            <h3>Search a job</h3>
            <p>
              Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus,
              nec ut commodo
            </p>
            <a href="#" className="learn-more">
              Learn more <span className="arrow">→</span>
            </a>
          </div>
          <div className="card">
            <div className="icon">
              <img src={chart} alt="Icon" />
            </div>
            <h3>Apply for a job</h3>
            <p>
              Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus,
              nec ut commodo
            </p>
            <a href="#" className="learn-more">
              Learn more <span className="arrow">→</span>
            </a>
          </div>
          <div className="card">
            <div className="icon">
              <img src={job} alt="Icon" />
            </div>
            <h3>Work!</h3>
            <p>
              Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus,
              nec ut commodo
            </p>
            <a href="#" className="learn-more">
              Learn more <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </>
    );
}