import "./styles/App.css";
import Header from "./componentes/Header.jsx";
import Footer from "./componentes/Footer.jsx";
import MainSection from "./componentes/MainSection.jsx";

export default function App() {
  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <MainSection />
      </div>
      <hr />
      <Footer />
    </div>
  );
}
