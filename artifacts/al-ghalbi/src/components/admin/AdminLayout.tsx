import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BarChart3, FolderTree, FileText, LogOut, BookOpen, Home } from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/admin", icon: BarChart3, label: "الإحصائيات" },
    { href: "/admin/categories", icon: FolderTree, label: "إدارة الأقسام" },
    { href: "/admin/notes", icon: FileText, label: "إدارة الملازم" },
  ];

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Background graphic */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/admin-bg.png`} 
          alt="Admin Background" 
          className="w-full h-full object-cover opacity-30 mix-blend-multiply"
        />
      </div>

      {/* Sidebar */}
      <aside className="w-72 bg-[#1A2744] text-white flex-shrink-0 relative z-10 shadow-2xl flex flex-col h-screen sticky top-0">
        <div className="p-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">الأستاذ عباس</h1>
              <span className="text-primary text-xs font-semibold">لوحة التحكم</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all font-medium"
          >
            <Home className="w-5 h-5" />
            العودة للموقع
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-y-auto" dir="rtl">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 px-8 py-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-gray-800">
            {navItems.find(n => n.href === location)?.label || "لوحة التحكم"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              أ
            </div>
          </div>
        </header>
        
        <div className="p-8 pb-24">
          {children}
        </div>
      </main>
    </div>
  );
}
