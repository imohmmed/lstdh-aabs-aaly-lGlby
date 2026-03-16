import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { BarChart3, FolderTree, FileText, BookOpen, Home, Menu, X, Video, LogOut, Settings } from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  const navItems = [
    { href: "/admin", icon: BarChart3, label: "الإحصائيات" },
    { href: "/admin/categories", icon: FolderTree, label: "إدارة الأقسام" },
    { href: "/admin/notes", icon: FileText, label: "إدارة الملازم" },
    { href: "/admin/banner", icon: Video, label: "بانر" },
    { href: "/admin/settings", icon: Settings, label: "الإعدادات" },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex w-full bg-gray-50 relative">
      {/* Background graphic */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src={`${import.meta.env.BASE_URL}images/admin-bg.png`}
          alt=""
          className="w-full h-full object-cover opacity-30 mix-blend-multiply"
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-64 bg-[#1A2744] text-white z-30 shadow-2xl flex flex-col
          transition-transform duration-300
          lg:sticky lg:top-0 lg:translate-x-0 lg:flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" onClick={closeSidebar}>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <BookOpen className="text-white w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base leading-tight">الأستاذ عباس</h1>
              <span className="text-primary text-xs font-semibold">لوحة التحكم</span>
            </div>
          </Link>
          {/* Close button (mobile only) */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all font-medium text-sm"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            العودة للموقع
          </Link>
          <button
            onClick={() => { closeSidebar(); handleLogout(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col min-h-screen overflow-y-auto" dir="rtl">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-display text-lg md:text-2xl font-bold text-gray-800">
              {navItems.find((n) => n.href === location)?.label || "لوحة التحكم"}
            </h2>
          </div>
          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            أ
          </div>
        </header>

        <div className="p-4 md:p-8 pb-24">
          {children}
        </div>
      </main>
    </div>
  );
}
