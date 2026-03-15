import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteCard } from "@/components/shared/NoteCard";
import { useGetCategories, useGetNotes } from "@workspace/api-client-react";
import { Search, Library, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") ? parseInt(searchParams.get("category")!) : undefined;
  
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(initialCategory);
  
  const { data: categories, isLoading: isLoadingCats } = useGetCategories();
  const { data: notes, isLoading: isLoadingNotes } = useGetNotes({ categoryId: selectedCategory });

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-secondary">
        {/* Background Image/Gradient */}
        <div className="absolute inset-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              منصة التعليم الأولى في العراق
            </div>
            <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-6" style={{lineHeight: "1.6"}}>
              تفوق في دراستك مع
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-200">
                ملازم الأستاذ عباس
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
              مكتبة شاملة من الملازم الدراسية، الملخصات، والأسئلة الوزارية مصممة لمساعدتك على تحقيق أعلى الدرجات.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-3xl p-6 shadow-xl border border-border/50 backdrop-blur-xl">
            <h2 className="font-display text-xl font-bold text-center mb-8 flex flex-col items-center gap-3">
              تصفح حسب القسم
              <div className="w-12 h-1.5 bg-primary rounded-full" />
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  selectedCategory === undefined
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "bg-secondary/5 text-foreground hover:bg-secondary/10"
                }`}
              >
                الكل
              </button>
              {isLoadingCats ? (
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-32 h-12 bg-secondary/10 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                      : "bg-secondary/5 text-foreground hover:bg-secondary/10"
                  }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notes Grid */}
      <section className="py-12 pb-24 min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
              <Library className="w-8 h-8 text-primary" />
              {selectedCategory 
                ? categories?.find(c => c.id === selectedCategory)?.name 
                : "جميع الملازم"}
            </h2>
            <div className="text-muted-foreground font-medium">
              {notes?.length || 0} ملزمة
            </div>
          </div>

          {isLoadingNotes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[400px] bg-secondary/5 animate-pulse rounded-[24px]" />
              ))}
            </div>
          ) : notes && notes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {notes.map((note, idx) => (
                <NoteCard key={note.id} note={note} index={idx} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-dashed border-border">
              <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">لا توجد ملازم</h3>
              <p className="text-muted-foreground">لم يتم إضافة أي ملازم في هذا القسم بعد.</p>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
