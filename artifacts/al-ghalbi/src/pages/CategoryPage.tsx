import { useParams, Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteCard } from "@/components/shared/NoteCard";
import { useGetCategories, useGetNotes } from "@workspace/api-client-react";
import { ArrowRight, Library, AlertCircle, Loader2 } from "lucide-react";

export default function CategoryPage() {
  const { id } = useParams();
  const catId = parseInt(id || "0", 10);

  const { data: categories } = useGetCategories();
  const { data: notes, isLoading } = useGetNotes({ categoryId: catId });

  const subCategory = categories?.find((c) => c.id === catId);
  const parentSection = categories?.find((c) => c.id === subCategory?.parentId);

  return (
    <AppLayout>
      {/* Hero strip */}
      <section className="relative bg-secondary pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt=""
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowRight className="w-4 h-4" /> الرئيسية
            </Link>
            {parentSection && (
              <>
                <span className="text-white/30">/</span>
                <span className="text-white/70">{parentSection.icon} {parentSection.name}</span>
              </>
            )}
            {subCategory && (
              <>
                <span className="text-white/30">/</span>
                <span className="text-white font-semibold">{subCategory.name}</span>
              </>
            )}
          </div>

          <h1 className="font-display text-2xl md:text-4xl font-bold text-white flex items-center gap-3">
            {subCategory?.icon && <span className="text-3xl">{subCategory.icon}</span>}
            {subCategory?.name || "القسم"}
          </h1>
          {parentSection && (
            <p className="text-white/60 mt-2 text-sm">{parentSection.icon} {parentSection.name}</p>
          )}
        </div>
      </section>

      {/* Notes Grid */}
      <section className="py-12 pb-24 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-xl border border-border/50 backdrop-blur-xl min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Library className="w-6 h-6 text-primary" />
                الملازم
              </h2>
              <span className="text-sm text-muted-foreground font-medium bg-secondary/5 px-3 py-1 rounded-full">
                {notes?.length || 0} ملزمة
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {notes.map((note, idx) => (
                  <NoteCard key={note.id} note={note} index={idx} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">لا توجد ملازم</h3>
                <p className="text-muted-foreground">لم يتم إضافة أي ملازم في هذا القسم بعد.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
