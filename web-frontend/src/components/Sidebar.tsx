import React from "react";
import { Plus, Users, UserPlus, Calendar, Layers } from "lucide-react"; // Pastikan install lucide-react untuk icon

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo Brand */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Wira<span className="text-pink-500">Plan</span>
          </span>
          <span className="text-pink-500">↗</span>
        </div>
      </div>

      {/* Main Action Button */}
      <div className="p-4">
        <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all">
          <Plus size={18} />
          Pasien Datang
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {/* Section: Pengobatan */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Pengobatan
          </p>
          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-pink-50 text-pink-600"
            >
              <Users size={18} />
              Pasien
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <UserPlus size={18} />
              Dokter
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Calendar size={18} />
              Jadwal Temu
            </a>
          </nav>
        </div>

        {/* Section: Master Data */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Master Data
          </p>
          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Layers size={18} />
              Jenis Dokter
            </a>
          </nav>
        </div>
      </div>
    </aside>
  );
}
