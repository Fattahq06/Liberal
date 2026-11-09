import { NavLink } from "react-router-dom";
import {
  Plus,
  Users,
  UserPlus,
  Calendar,
  Layers,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

interface MenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: "Insight",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Pengobatan",
    items: [
      { to: "/pasien", label: "Pasien", icon: Users },
      { to: "/dokter", label: "Dokter", icon: UserPlus },
      { to: "/jadwal-temu", label: "Jadwal Temu", icon: Calendar },
    ],
  },
  {
    title: "Master Data",
    items: [{ to: "/jenis-dokter", label: "Jenis Dokter", icon: Layers }],
  },
];

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
        {MENU_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              {section.title}
            </p>
            <nav className="space-y-1">
              {section.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-pink-50 text-pink-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
