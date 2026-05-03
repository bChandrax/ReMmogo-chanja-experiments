import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page/LandingPage";
import PersonalDashboard from "./pages/personal-dashboard/personalDashboard";
import LoginPage from "./pages/login/LoginPage";
import MyGroups from "./pages/mygroups/myGroups";
import ExplorePage from "./pages/explore/explorePage";
import MyContributions from "./pages/myContributions/myContributions";
import MyLoans from "./pages/myLoans/myLoans";
import Notifications from "./pages/Notifications/Notifications";
import MyStatements from "./pages/myStatements/myStatements";
import PaymentProof from "./pages/paymentProof/paymentProof";
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pdash" element={<PersonalDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/myGroups" element={<MyGroups />} />
      <Route path="/exploreGroups" element={<ExplorePage />} />
      <Route path="/myContributions" element={<MyContributions />} />
      <Route path="/myLoans" element={<MyLoans />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/myStatements" element={<MyStatements />} />
      <Route path="/paymentProofs" element={<PaymentProof />} />
      <Route path="/myStatements" element={<MyStatements />} />
    </Routes>
  );
}

export default App;
