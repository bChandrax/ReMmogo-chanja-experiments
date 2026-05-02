import { useState, lazy } from "react";
import SideBar from "../../components/sideBar/sideBar";
import './myLoans.css'; 
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";

export default function MyLoans() {
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