import "./styles/App.css";
import Header from "./componentes/Header.jsx";
import Footer from "./componentes/Footer.jsx";

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="content">{/* Tu contenido principal aquí */}</main>
      <Footer/>
    </div>
  );
}
