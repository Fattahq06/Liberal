import React from "react";
import { LayoutGrid, Bell } from "lucide-react";

interface HeaderProps {
  pageTitle: string;
  breadcrumb: string;
}

export default function Header({ pageTitle, breadcrumb }: HeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Title & Breadcrumb */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-xs text-gray-400 mt-0.5">{breadcrumb}</p>
      </div>

      {/* Right Icons & Profile */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <LayoutGrid size={20} />
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full"></span>
        </button>
        <div className="h-8 w-[1px] bg-gray-200"></div>
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        </div>
      </div>
    </header>
  );
}
