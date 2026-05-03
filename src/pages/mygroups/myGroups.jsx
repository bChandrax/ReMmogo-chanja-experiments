import { useState, lazy } from "react";
import SideBar from "../../components/sideBar/sideBar";
import './myGroups.css';
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";
import GroupCard from "../../components/GroupCard/GroupCard";

export default function MyGroups() {
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