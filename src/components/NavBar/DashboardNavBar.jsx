import { Search } from "lucide-react";

export default function DashboardNavBar() {
  return(
    <div className="topbar">
          <div className="topbar-left">
            <h1>Welcome back, Aarav</h1>
            <p>Here's a real-time snapshot of your financial health across accounts and obligations</p>
          </div>
          <input type="text" className="search-box" placeholder="🔍 Search" />
          <button className="btn">Create Group</button>
          <button className="btn">Add Member</button>
          <button className="btn">Record payment</button>
        </div>
  );
}