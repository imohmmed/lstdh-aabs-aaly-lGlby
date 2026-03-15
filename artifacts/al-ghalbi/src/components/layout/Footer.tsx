import { Link } from "wouter";
import { BookOpen, Send, Mail, MapPin } from "lucide-react";
import { useGetCategories } from "@workspace/api-client-react";

export function Footer() {
  const { data: categories } = useGetCategories();

  return (
    <footer className="bg-[#1A2744] text-white/80 pt-16 pb-8 border-t-[6px] border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group inline-block">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen className="text-primary w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">الأستاذ عباس</h3>
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
              {categories?.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link href={`/?category=${category.id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    {category.name}
                  </Link>
                </li>
              ))}
              {!categories?.length && <li className="text-white/40">جاري التحميل...</li>}
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
                <a href="https://t.me/abbas_alghalbi" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#2AABEE] transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#2AABEE]/20 transition-colors">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="font-medium" dir="ltr">@abbas_alghalbi</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-medium">العراق - بغداد</span>
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
