import { useState, lazy } from "react";
import SideBar from "../../components/sideBar/sideBar";
import './ExplorePage.css'; 
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";
import GroupCard from "../../components/GroupCard/GroupCard";

export default function ExplorePage() {
  return (
    <div className="dash">
      <SideBar />
    
      <div className="main">
        <DashboardNavBar />
        <div className="content">
          <h2>My Groups</h2>
          <br />
          <div className="groups-list">
            <GroupCard />
            <GroupCard />
            <GroupCard />
          </div>
        </div>
      </div>
    </div>
  );
}