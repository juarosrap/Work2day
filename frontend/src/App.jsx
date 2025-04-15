import "./styles/App.css";
import Header from "./componentes/Header.jsx";
import Footer from "./componentes/Footer.jsx";
import Home from "./componentes/Home.jsx";
import { Route,Link,Routes } from "react-router-dom";
import Jobs from "./componentes/Jobs.jsx";
import JobsDetail from "./componentes/JobsDetail.jsx";
import DashBoard from "./componentes/DashBoard.jsx";
import Profile from "./componentes/Profile.jsx";
import ModalForm from "./componentes/registerModal.jsx";
import LoginModal from "./componentes/loginModal.jsx";
import ApplyForm from "./componentes/ApplyForm.jsx";
import JobForm from "./componentes/JobForm.jsx";


export default function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<ModalForm />} />
        <Route path="/loginForm" element={<LoginModal />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/jobsDetail/:id" element={<JobsDetail />} />
        <Route path="/jobs/jobsDetail/apply" element={<ApplyForm />} />
        <Route path="/jobs/apply" element={<ApplyForm />} />
        <Route path="/dashboard/:id" element={<DashBoard />} />
        <Route path="/dashboard/:id/jobForm" element={<JobForm />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
      <hr />
      <Footer />
    </div>
  );
}
