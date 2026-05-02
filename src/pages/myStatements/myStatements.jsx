import { useState, lazy } from "react";
import SideBar from "../../components/sideBar/sideBar";
import './myStatements.css'; 
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";

export default function MyStatements() {
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