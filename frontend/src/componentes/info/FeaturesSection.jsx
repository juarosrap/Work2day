import "../../styles/FeaturesSection.css";
import { BriefcaseBusiness, ChartNoAxesColumnIncreasing, Search } from "lucide-react";

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
              <Search size={32} className="about-icon green" />
            </div>
            <h3>Search a job</h3>
            <p>
              Explore job listings tailored to your skills and preferences. Use
              filters to find the right match faster.
            </p>
            <a href="#" className="learn-more">
              Learn more <span className="arrow">→</span>
            </a>
          </div>
          <div className="card">
            <div className="icon">
              <ChartNoAxesColumnIncreasing size={32} />
            </div>
            <h3>Apply for a job</h3>
            <p>
              Apply to multiple jobs with a single click. Track your
              applications and stay updated on responses
            </p>
            <a href="#" className="learn-more">
              Learn more <span className="arrow">→</span>
            </a>
          </div>
          <div className="card">
            <div className="icon">
              <BriefcaseBusiness size={32} className="about-icon blue" />
            </div>
            <h3>Work!</h3>
            <p>
              Once selected, start working right away. Get paid securely and
              rate your experience after each job.
            </p>
            <a href="#" className="learn-more">
              Learn more <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </>
    );
}