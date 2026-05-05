import { Search, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function DashboardNavBar() {
  const { user } = useAuth();
  
  return(
    <div className="topbar">
      <div className="topbar-left">
        <h1>Welcome back, {user?.firstName || "User"}</h1>
        <p>Here's a real-time snapshot of your financial health across accounts and obligations</p>
      </div>
      <input type="text" className="search-box" placeholder="🔍 Search" />
      <button className="btn"><Bell size={18} /> Notifications</button>
    </div>
  );
}
