import { Search, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./DashboardNavBar.css";

export default function DashboardNavBar() {
  const { user } = useAuth();
  
  return(
    <div className="topbar">
      <div className="topbar-left">
        <h1>Welcome back, {user?.firstName || "User"}</h1>
      </div>
      
      <div className="topbar-right">
        <div className="search-box">
          <Search size={18} style={{ color: '#9ca3af' }} />
          <input type="text" placeholder="Search..." />
        </div>
        
        <button className="btn">
          <Bell size={18} />
          <span>Notifications</span>
          <span className="notification-badge"></span>
        </button>
      </div>
    </div>
  );
}
