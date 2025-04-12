import "./styles/App.css";
import Header from "./componentes/Header.jsx";
import Footer from "./componentes/Footer.jsx";
import MainSection from "./componentes/MainSection.jsx";
import { Route } from "react-router-dom";
import Jobs from "./componentes/Jobs.jsx";
import JobsDetail from "./componentes/JobsDetail.jsx";
import DashBoard from "./componentes/DashBoard.jsx";
import Profile from "./componentes/Profile.jsx";

export default function App() {
  return (
    <div className="app">
      <Header />
      {/* <div className="main-content">
        <MainSection />
      </div> */}
      {/* <JobsDetail/> */}

      {/* <DashBoard /> */}
        <Profile/>
      <hr />
      <Footer />
    </div>
  );
}
