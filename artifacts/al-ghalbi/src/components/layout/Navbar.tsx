import { Link } from "wouter";
import { Search, Moon, Sun, Menu, X, BookOpen, User, Home, LayoutDashboard } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 mx-4 sm:mx-6 lg:mx-8 mt-1 glass-panel rounded-2xl border border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Right side - Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="text-white w-4 h-4" />
                </div>
                <span className="font-display font-bold text-foreground text-sm md:text-base lg:text-lg leading-tight">
                  <span className="md:hidden">الأستاذ عباس علي الغالبي</span>
                  <span className="hidden md:inline">الأستاذ عباس علي الغالبي</span>
                </span>
              </Link>
            </div>

            {/* Left side - Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <nav className="flex items-center gap-6 me-6 text-sm font-semibold">
                <Link href="/" className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5">
                  <Home className="w-4 h-4" /> الرئيسية
                </Link>
                <Link href="/admin" className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> الإدارة
                </Link>
              </nav>

              <div className="flex items-center gap-2 border-s border-border ps-4">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-foreground/70 hover:bg-secondary/10 hover:text-primary transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-foreground/70 hover:bg-secondary/10 hover:text-primary transition-colors"
                >
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-foreground/70"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-foreground/70"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Expandable Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden bg-background"
            >
              <div className="max-w-3xl mx-auto px-4 py-4">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ابحث عن ملزمة..."
                    className="w-full h-12 pl-4 pr-12 rounded-xl bg-secondary/10 border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground outline-none"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[80vw] bg-card z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <span className="font-display font-bold text-xl text-foreground">القائمة</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary/10 text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-4 rounded-xl hover:bg-secondary/10 text-foreground font-semibold transition-colors">
                  <Home className="w-5 h-5 text-primary" /> الرئيسية
                </Link>
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-4 rounded-xl hover:bg-secondary/10 text-foreground font-semibold transition-colors">
                  <LayoutDashboard className="w-5 h-5 text-primary" /> لوحة الإدارة
                </Link>
              </div>
              <div className="p-6 border-t border-border">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full p-4 rounded-xl bg-secondary/5 hover:bg-secondary/10 text-foreground font-semibold transition-colors"
                >
                  <span className="flex items-center gap-3">
                    {theme === "light" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                    {theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
