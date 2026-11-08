import React from "react";
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
} from "lucide-react";

export default function PatientContainer() {
  // Dummy data pasien sesuai gambar
  const patients = [
    {
      id: 1,
      initials: "AR",
      name: "Andira Rama",
      code: "PT-0001",
      status: "Aktif",
    },
    {
      id: 2,
      initials: "RS",
      name: "Rianto Sinaga",
      code: "PT-0002",
      status: "Aktif",
    },
    {
      id: 3,
      initials: "YS",
      name: "Yulianti Sari",
      code: "PT-0003",
      status: "Aktif",
    },
    { id: 4, initials: "D", name: "Diana", code: "PT-0004", status: "Aktif" },
    {
      id: 5,
      initials: "FW",
      name: "Ferry Wibowo",
      code: "PT-0005",
      status: "Aktif",
    },
    {
      id: 6,
      initials: "NQ",
      name: "Nina Qori",
      code: "PT-0006",
      status: "Aktif",
    },
    {
      id: 7,
      initials: "TZ",
      name: "Tara Zahra",
      code: "PT-0007",
      status: "Aktif",
    },
    {
      id: 8,
      initials: "SW",
      name: "Sandi Wira",
      code: "PT-0008",
      status: "Aktif",
    },
    {
      id: 9,
      initials: "MK",
      name: "Maya Kusuma",
      code: "PT-0009",
      status: "NonAktif",
    },
    {
      id: 10,
      initials: "JL",
      name: "Joko Laras",
      code: "PT-0010",
      status: "NonAktif",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Card Wrapper */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-8">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Daftar Pasien</h2>
          <p className="text-sm text-gray-400 mt-1">
            Menampilkan seluruh daftar pasien yang terdaftar
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              Filter
            </button>
            <div className="relative flex-1 sm:w-80">
              <Search
                className="absolute left-3.5 top-3 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={16} />
              Download Data
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all">
              <Plus size={16} />
              Tambah Pasien
            </button>
          </div>
        </div>

        {/* Table */}
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
              {patients.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                      {item.initials}
                    </div>
                    <span className="font-semibold text-gray-800">
                      {item.name}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-500">
                    Kode:{" "}
                    <span className="font-medium text-gray-800">
                      {item.code}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Aktif"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${item.status === "Aktif" ? "bg-emerald-500" : "bg-rose-500"}`}
                      ></span>
                      {item.status}
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
                        className={`p-2 transition-colors ${item.status === "Aktif" ? "text-gray-400 hover:text-rose-500" : "text-gray-400 hover:text-emerald-500"}`}
                      >
                        {item.status === "Aktif" ? (
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
            <span>dari 600 data</span>
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
      </div>
    </div>
  );
}
