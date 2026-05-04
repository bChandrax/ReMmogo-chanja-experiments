import { Search } from "lucide-react";
import { Bell, PlusIcon } from "lucide-react";
import "./DashboardNavBar.css";

export default function DashboardNavBar() {
  return(
    <div className="topbar">
          <div className="topbar-left">
            <h1>Welcome back, Aarav</h1>
            <p>Here's a real-time snapshot of your financial health across accounts and obligations</p>
          </div>
          <input type="text" className="search-box" placeholder="🔍 Search" />
          <button className="btn"><Bell size={18} /> Notifications</button>
        </div>
  );
}