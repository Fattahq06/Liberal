import React, { useState, useEffect } from "react";
import {
  Filter,
  Search,
  Download,
  Plus,
  Copy,
  Edit2,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from "lucide-react";
import AddPatientContainer from "./AddPatientContainer";

export default function PatientContainer() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk mengatur perpindahan halaman ("list" atau "add")
  const [currentView, setCurrentView] = useState<"list" | "add">("list");

  // Fungsi fetch data pasien dari server Express
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/patients/all");
      const result = await response.json();

      setPatients(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Gagal mengambil data pasien dari server:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // JIKA USER KLIK TOMBOL TAMBAH, PINDAH KE HALAMAN AddPatientContainer
  if (currentView === "add") {
    return (
      <AddPatientContainer
        onBack={() => setCurrentView("list")}
        onSuccess={() => {
          setCurrentView("list");
          fetchPatients(); // Refresh data otomatis setelah berhasil simpan
        }}
      />
    );
  }

  // TAMPILAN UTAMA (DAFTAR PASIEN / TABEL / EMPTY STATE)
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Card Wrapper */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-8">
        {/* HEADER UTAMA & TOMBOL AKSI (Selalu tampil di atas) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pasien</h2>
            <p className="text-sm text-gray-400 mt-1">
              Menampilkan seluruh daftar pasien yang terdaftar
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tombol Filter / Search Opsional */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Cari pasien..."
                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Tombol Tambah Pasien Utama */}
            <button
              onClick={() => setCurrentView("add")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all whitespace-nowrap"
            >
              <Plus size={16} />
              Tambah Pasien
            </button>
          </div>
        </div>

        {/* Conditional Rendering Berdasarkan Data Server */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            Memuat data pasien...
          </div>
        ) : patients.length === 0 ? (
          /* TAMPILAN EMPTY STATE JIKA DATA KOSONG */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-48 h-48 mb-6 flex items-center justify-center bg-pink-50/50 rounded-full text-pink-500">
              <PackageOpen size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Belum Ada Data Pasien
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Saat ini data pasien masih kosong
            </p>
            <button
              onClick={() => setCurrentView("add")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all"
            >
              <Plus size={16} />
              Tambah Pasien
            </button>
          </div>
        ) : (
          /* TABLE HANYA MUNCUL JIKA DATA ADA */
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {patients.map((item: any) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                          {item.nama?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {item.nama}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        Kode:{" "}
                        <span className="font-medium text-gray-800">
                          {item.kodePasien}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            (item.status || "Aktif") === "Aktif"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              (item.status || "Aktif") === "Aktif"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          ></span>
                          {item.status || "Aktif"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
                            <Copy size={16} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-amber-500 transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={`p-2 transition-colors ${
                              (item.status || "Aktif") === "Aktif"
                                ? "text-gray-400 hover:text-rose-500"
                                : "text-gray-400 hover:text-emerald-500"
                            }`}
                          >
                            {(item.status || "Aktif") === "Aktif" ? (
                              <Ban size={16} />
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>Menampilkan</span>
                <select className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-pink-500">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
                <span>dari {patients.length} data</span>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                  <ChevronLeft size={16} />
                  <ChevronLeft size={16} className="-ml-2" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-gray-100 font-semibold text-gray-800 flex items-center justify-center">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-600 flex items-center justify-center">
                  2
                </button>
                <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-600 flex items-center justify-center">
                  3
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                  <ChevronRight size={16} />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                  <ChevronRight size={16} />
                  <ChevronRight size={16} className="-ml-2" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
