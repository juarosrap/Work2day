import "../styles/MainSection.css";
import HeroSection from "./HeroSection.jsx";
import FeaturesSection from "./FeaturesSection.jsx";

export default function Home(){
    return (
      <div className="main">
        <div className="section-top">
          <HeroSection />
        </div>
        <hr />
        <div className="section-bottom">
          <FeaturesSection />
        </div>
      </div>
    );
}