import { Routes, Route, BrowserRouter } from "react-router-dom";
import LandingPage from "./pages/landing-page/LandingPage";
import PersonalDashboard from "./pages/personal-dashboard/PersonalDashboard";
import LoginPage from "./pages/login/LoginPage";
import MyGroups from "./pages/mygroups/myGroups";
import ExplorePage from "./pages/explore/ExplorePage";
import MyContributions from "./pages/myContributions/myContributions";
import MyLoans from "./pages/myLoans/myLoans";
import CreateGroup from "./pages/CreateGroup/Creategroup";
import GroupDashboard from "./pages/group-dashboard/groupDashboard";
import MessagesPage from "./pages/messages/MessagesPage";
import SettingsPage from "./pages/settings/SettingsPage";
import SupportPage from "./pages/support/SupportPage";
import PageTransition from "./components/pageTransition/pgTrans";
import './App.css';

function App() {
  return (
  <BrowserRouter>
    <PageTransition>
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
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/support" element={<SupportPage />} />
    </Routes>
    </PageTransition>
  </BrowserRouter>
  )
}

export default App;
