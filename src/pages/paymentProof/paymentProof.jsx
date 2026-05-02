import { useState, lazy } from "react";
import SideBar from "../../components/sideBar/sideBar";
import './paymentProof.css'; 
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";

export default function paymentProof() {
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