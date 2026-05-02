import { useState, lazy } from "react";
import SideBar from "../../components/sideBar/sideBar";
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";
import "./myContributions.css";

export default function myContributions() {
  return (
    <div className="dash">
      <SideBar />

      <div className="main">
        <DashboardNavBar />
        <div className="content"></div>
        
      </div>
    </div>
  );
}