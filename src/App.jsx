import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page/LandingPage";
import PersonalDashboard from "./pages/personal-dashboard/personalDashboard";
import LoginPage from "./pages/login/LoginPage";
import MyGroups from "./pages/mygroups/myGroups";
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pdash" element={<PersonalDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mygroups" element={<MyGroups />} />
    </Routes>
  );
}

export default App;
