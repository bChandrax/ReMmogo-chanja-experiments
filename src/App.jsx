import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page/LandingPage";
import PersonalDashboard from "./pages/personal-dashboard/personalDashboard";
import LoginPage from "./pages/login/LoginPage";
import MyGroups from "./pages/mygroups/myGroups";
import ExplorePage from "./pages/explore/explorePage";
import MyContributions from "./pages/myContributions/myContributions";
import MyLoans from "./pages/myLoans/myLoans";
import CreateGroup from "./pages/CreateGroup/Creategroup";
import GroupDashboard from "./pages/group-dashboard/groupDashboard";
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pdash" element={<PersonalDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/myGroups" element={<MyGroups />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/myContributions" element={<MyContributions />} />
      <Route path="/myLoans" element={<MyLoans />} />
      <Route path="/createGroup" element={<CreateGroup />} />
      <Route path="/GrpDash" element={<GroupDashboard />} />
    </Routes>
  );
}

export default App;
