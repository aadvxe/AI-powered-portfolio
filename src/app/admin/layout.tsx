"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, 
  Briefcase, 
  Layers, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // Middleware will handle protection, but good to force
    router.refresh();
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Projects", icon: Briefcase, path: "/admin/projects" },
    { name: "Profile", icon: UserIcon, path: "/admin/profile" },
    { name: "Skills", icon: Layers, path: "/admin/skills" },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-800">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="fixed left-0 top-0 z-40 h-screen border-r border-neutral-200 bg-white/80 backdrop-blur-xl transition-all duration-300 hidden md:flex flex-col"
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-100">
           {isSidebarOpen && <span className="font-bold text-lg tracking-tight">Admin Site</span>}
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"
           >
             {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isActive 
                            ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10" 
                            : "text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-900"
                        }`}
                        title={!isSidebarOpen ? item.name : ""}
                    >
                        <item.icon size={20} className={isActive ? "text-white" : ""} />
                        {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                    </button>
                )
            })}
        </nav>

        <div className="p-4 border-t border-neutral-100">
            <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all ${!isSidebarOpen && 'justify-center px-0'}`}
            >
                <LogOut size={20} />
                {isSidebarOpen && <span className="font-medium">Sign Out</span>}
            </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-[260px]" : "md:ml-[80px]"}`}>
        <div className="p-8 max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}
