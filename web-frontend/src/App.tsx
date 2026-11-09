import { useCallback, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PatientContainer from "./components/PatientContainer";
import JenisDokterContainer from "./components/JenisDokterContainer";
import ComingSoon from "./components/ComingSoon";

export default function App() {
  // Judul & breadcrumb header diatur oleh halaman yang sedang aktif
  const [header, setHeader] = useState({
    title: "Pasien",
    breadcrumb: "Pengobatan > Pasien",
  });

  const handleHeaderChange = useCallback(
    (title: string, breadcrumb: string) =>
      setHeader((prev) =>
        prev.title === title && prev.breadcrumb === breadcrumb
          ? prev
          : { title, breadcrumb },
      ),
    [],
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* 1. Side Menu */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Menu / Header */}
        <Header pageTitle={header.title} breadcrumb={header.breadcrumb} />

        {/* 3. Container Utama: berganti sesuai menu yang dipilih */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/pasien" replace />} />

            <Route
              path="/dashboard"
              element={
                <ComingSoon
                  title="Dashboard"
                  breadcrumb="Insight > Dashboard"
                  onHeaderChange={handleHeaderChange}
                />
              }
            />
            <Route
              path="/pasien"
              element={<PatientContainer onHeaderChange={handleHeaderChange} />}
            />
            <Route
              path="/dokter"
              element={
                <ComingSoon
                  title="Dokter"
                  breadcrumb="Pengobatan > Dokter"
                  onHeaderChange={handleHeaderChange}
                />
              }
            />
            <Route
              path="/jadwal-temu"
              element={
                <ComingSoon
                  title="Jadwal Temu"
                  breadcrumb="Pengobatan > Jadwal Temu"
                  onHeaderChange={handleHeaderChange}
                />
              }
            />
            <Route
              path="/jenis-dokter"
              element={
                <JenisDokterContainer onHeaderChange={handleHeaderChange} />
              }
            />

            {/* Alamat yang tidak dikenal -> kembali ke Pasien */}
            <Route path="*" element={<Navigate to="/pasien" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
