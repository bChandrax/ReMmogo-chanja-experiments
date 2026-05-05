import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/pdash" element={
          <ProtectedRoute><PersonalDashboard /></ProtectedRoute>
        } />
        <Route path="/myGroups" element={
          <ProtectedRoute><MyGroups /></ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute><ExplorePage /></ProtectedRoute>
        } />
        <Route path="/myContributions" element={
          <ProtectedRoute><MyContributions /></ProtectedRoute>
        } />
        <Route path="/myLoans" element={
          <ProtectedRoute><MyLoans /></ProtectedRoute>
        } />
        <Route path="/createGroup" element={
          <ProtectedRoute><CreateGroup /></ProtectedRoute>
        } />
        <Route path="/GrpDash" element={
          <ProtectedRoute><GroupDashboard /></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute><MessagesPage /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><SettingsPage /></ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute><SupportPage /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
