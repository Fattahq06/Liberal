import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PatientContainer from "./components/PatientContainer";

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* 1. Side Menu */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Menu / Header */}
        <Header pageTitle="Pasien" breadcrumb="Pengobatan > Pasien" />

        {/* 3. Container Utama */}
        <main className="flex-1 overflow-y-auto">
          <PatientContainer />
        </main>
      </div>
    </div>
  );
}
