import "./styles/App.css";
import Header from "./componentes/Header.jsx";
import Footer from "./componentes/Footer.jsx";
import Home from "./componentes/Home.jsx";
import { Route,Link,Routes } from "react-router-dom";
import Jobs from "./componentes/Jobs.jsx";
import JobsDetail from "./componentes/JobsDetail.jsx";
import DashBoard from "./componentes/DashBoard.jsx";
import Profile from "./componentes/Profile.jsx";

export default function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/jobsDetail" element={<JobsDetail />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <hr />
      <Footer />
    </div>
  );
}
