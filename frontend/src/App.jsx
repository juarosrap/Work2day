import "./styles/App.css";
import Header from "./componentes/shared/Header.jsx";
import Footer from "./componentes/shared/Footer.jsx";
import Home from "./componentes/info/Home.jsx";
import { Route,Routes } from "react-router-dom";
import Jobs from "./componentes/job/Jobs.jsx";
import JobsDetail from "./componentes/job/JobsDetail.jsx";
import DashBoard from "./componentes/dashboard/DashBoard.jsx";
import Profile from "./componentes/profile/Profile.jsx";
import ModalForm from "./componentes/auth/registerModal.jsx";
import LoginModal from "./componentes/auth/loginModal.jsx";
import ApplyForm from "./componentes/job/ApplyForm.jsx";
import JobForm from "./componentes/job/JobForm.jsx";
import DeleteJob from "./componentes/job/DeleteJob.jsx";
import EditProfile from "./componentes/profile/EditProfile.jsx";
import ListaCandidatos from "./componentes/dashboard/ListaCandidatos.jsx";
import AboutUs from "./componentes/info/AboutUs.jsx";
import ForgetModal from "./componentes/auth/ForgetModal.jsx";
import ResetPassword from "./componentes/auth/ResetPassword.jsx";
import ChangePassword from "./componentes/auth/ChangePassword.jsx";
import Valoracion from "./componentes/profile/Valoracion.jsx";
import DeleteAccount from "./componentes/profile/DeleteAccount.jsx";

export default function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/form" element={<ModalForm />} />
        <Route path="/loginForm" element={<LoginModal />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgetPassword" element={<ForgetModal />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/jobsDetail/:id" element={<JobsDetail />} />
        <Route path="/jobs/jobsDetail/:id/apply" element={<ApplyForm />} />
        <Route path="/dashboard/:id" element={<DashBoard />} />
        <Route
          path="/dashboard/:id/candidatos/:ofertaId"
          element={<ListaCandidatos />}
        />
        <Route path="/dashboard/:id/jobForm" element={<JobForm />} />
        <Route path="/dashboard/:id/edit/:ofertaId" element={<JobForm />} />
        <Route path="/dashboard/:id/delete/:ofertaId" element={<DeleteJob />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route
          path="/dashboard/:id/:ofertaId/valoracion/:valoradoId"
          element={<Valoracion />}
        />

        <Route
          path="/dashboard/:id/valoracion/:valoradoId/:ofertaId"
          element={<Valoracion />}
        />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
      </Routes>
      <hr />
      <Footer />
    </div>
  );
}
