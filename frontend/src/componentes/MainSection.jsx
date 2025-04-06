import "../styles/MainSection.css";
import HeroSection from "./HeroSection.jsx";

export default function MainSection(){
    return (
      <div className="main">
        <div className="section-top">
            <HeroSection/>
        </div>
        <div className="section-bottom">
            Fila 2
        </div>
      </div>
    );
}