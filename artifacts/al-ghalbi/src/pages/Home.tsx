import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCategories } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";

export default function Home() {
  usePageTitle("الرئيسية");
  const { data: categories, isLoading: isLoadingCats } = useGetCategories();
  const [, navigate] = useLocation();

  const sections = (categories?.filter((c) => !c.parentId) ?? []).sort((a, b) => a.order - b.order);
  const subCategoriesOf = (sectionId: number) =>
    (categories?.filter((c) => c.parentId === sectionId) ?? []).sort((a, b) => a.order - b.order);

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-36 overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt=""
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
            <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ lineHeight: "1.6" }}>
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

      {/* Sections + Sub-sections */}
      <section className="py-12 pb-24 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {isLoadingCats ? (
            <div className="bg-card rounded-3xl p-8 shadow-xl border border-border/50 space-y-6">
              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="h-6 w-48 bg-secondary/10 animate-pulse rounded-lg mb-4" />
                  <div className="flex gap-3 flex-wrap">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-12 w-36 bg-secondary/10 animate-pulse rounded-xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : sections.length === 0 ? (
            <div className="bg-card rounded-3xl p-10 shadow-xl border border-border/50 text-center text-muted-foreground">
              لا توجد أقسام بعد، يمكنك إضافتها من لوحة الإدارة.
            </div>
          ) : (
            sections.map((section, si) => {
              const subs = subCategoriesOf(section.id);
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: si * 0.1 }}
                  className="bg-card rounded-3xl p-6 md:p-8 shadow-xl border border-border/50 backdrop-blur-xl"
                >
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-6">
                    {section.icon && (
                      <span className="text-2xl">{section.icon}</span>
                    )}
                    <h2 className="font-display text-lg md:text-xl font-bold text-foreground">
                      {section.name}
                    </h2>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Sub-sections */}
                  {subs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">لا توجد أقسام فرعية بعد.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {subs.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => navigate(`/category/${sub.id}`)}
                          className="group flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all duration-200 text-right"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {sub.icon && <span className="text-xl flex-shrink-0">{sub.icon}</span>}
                            <span className="font-bold text-foreground truncate">{sub.name}</span>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </AppLayout>
  );
}
