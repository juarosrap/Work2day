import "../../styles/MainSection.css";
import HeroSection from "./HeroSection.jsx";
import FeaturesSection from "./FeaturesSection.jsx";
import { motion } from "framer-motion";

export default function Home(){
    return (
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="main"
    >
      <div className="section-top">
          <HeroSection />
        </div>
        <hr />
        <div className="section-bottom">
          <FeaturesSection />
        </div>
    </motion.div>
      
    );
}