import { Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import "./DashboardNavBar.css";

export default function DashboardNavBar() {
  const { user } = useAuth();

  return(
    <div className="topbar">
      <div className="topbar-left">
        <h1>Welcome back, {user?.firstName || "User"}</h1>
        <p>Here's a real-time snapshot of your financial health across accounts and obligations</p>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <Search size={18} style={{ color: '#9ca3af' }} />
          <input type="text" placeholder="Search..." />
        </div>

        <NotificationDropdown />
      </div>
    </div>
  );
}
