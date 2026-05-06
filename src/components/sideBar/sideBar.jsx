import { Handshake, Settings, Info, Home, GroupIcon, Banknote, Coins, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./sideBar.css";

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">
          <Handshake size={18} />
        </div>
        <span className="logo-text">ReMmogo</span>
        <span className="logo-k">K</span>
      </div>

      <nav className="navigation">
        <Link to="/pdash"            className={`nav-item ${location.pathname === "/dashboard"         ? "nav-item-active" : ""}`}><Home size={18} /> <p>Dashboard</p></Link>
        <Link to="/myGroups"         className={`nav-item ${location.pathname === "/my-groups"         ? "nav-item-active" : ""}`}><GroupIcon size={18} /><p>My Groups</p></Link>
        <Link to="/myContributions"  className={`nav-item ${location.pathname === "/my-contributions"  ? "nav-item-active" : ""}`}><Coins size={18} /> <p>My Contributions</p></Link>
        <Link to="/myLoans"          className={`nav-item ${location.pathname === "/my-loans"          ? "nav-item-active" : ""}`}><Banknote size={18} /> <p>My Loans</p></Link>

        <div className="nav-divider" />

        <Link to="/support"  className="nav-item"><Info size={18} /> <p>More Info</p></Link>
        <Link to="/settings" className="nav-item"><Settings size={18} /> <p>Settings</p></Link>
      </nav>

      <div className="sidebar-bottom">
        <div className="user-row">
          <div className="user-avatar">
            {user?.firstName?.charAt(0) || "U"}
          </div>
          <div className="user-info">
            <p>{user?.firstName ? `${user.firstName}` : "User"}</p>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>

    </aside>
  );
}