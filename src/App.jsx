import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page/LandingPage";
import PersonalDashboard from "./pages/personal-dashboard/PersonalDashboard";
import LoginPage from "./pages/login/LoginPage";
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/personal-dashboard" element={<PersonalDashboard />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
