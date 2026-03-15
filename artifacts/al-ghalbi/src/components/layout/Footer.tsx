import { Link } from "wouter";
import { BookOpen, Send, Instagram } from "lucide-react";
import { useGetCategories } from "@workspace/api-client-react";

export function Footer() {
  const { data: categories } = useGetCategories();

  const sections = categories?.filter((c) => !c.parentId) ?? [];

  return (
    <footer className="bg-[#1A2744] text-white/80 pt-16 pb-8 border-t-[6px] border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 mb-12">

          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="text-primary w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white leading-tight">الأستاذ عباس</h3>
                <p className="text-primary text-sm font-semibold">منصة تعليمية متكاملة</p>
              </div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs text-balance">
              منصة تعليمية تهدف إلى توفير أفضل الملازم والمحتوى الدراسي للطلاب بأسلوب عصري يسهل الوصول إليه.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              الأقسام الدراسية
            </h4>
            <ul className="space-y-3">
              {sections.length === 0 && (
                <li className="text-white/40 text-sm">جاري التحميل...</li>
              )}
              {sections.map((section) => {
                const subs = categories?.filter((c) => c.parentId === section.id) ?? [];
                return (
                  <li key={section.id}>
                    {/* Section title — no link */}
                    <span className="text-white font-bold text-sm flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {section.icon} {section.name}
                    </span>
                    {/* Sub-sections — with links */}
                    {subs.length > 0 && (
                      <ul className="ps-4 space-y-1">
                        {subs.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/category/${sub.id}`}
                              className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-2"
                            >
                              <span className="w-1 h-1 rounded-full bg-white/30" />
                              {sub.icon} {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              تواصل معنا
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://t.me/adb_3"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 hover:text-[#2AABEE] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#2AABEE]/20 transition-colors">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="font-medium" dir="ltr">@adb_3</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/abga0?igsh=dHMzcDJvbDNpcmc1"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 hover:text-[#E1306C] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#E1306C]/20 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="font-medium" dir="ltr">@abga0</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} الأستاذ عباس علي الغالبي. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <Link href="/admin" className="hover:text-white transition-colors">لوحة الإدارة</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
