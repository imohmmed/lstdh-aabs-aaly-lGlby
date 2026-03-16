import { useParams, Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteCard } from "@/components/shared/NoteCard";
import { NoteListCard } from "@/components/shared/NoteListCard";
import { useGetCategories, useGetNotes } from "@workspace/api-client-react";
import { ArrowRight, Library, AlertCircle, Loader2, LayoutGrid, List } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useState } from "react";

type ViewMode = "grid" | "list";

function getStoredView(): ViewMode {
  try {
    const v = localStorage.getItem("notes_view");
    if (v === "list" || v === "grid") return v;
  } catch {}
  return "grid";
}

export default function CategoryPage() {
  const { id } = useParams();
  const catId = parseInt(id || "0", 10);

  const { data: categories } = useGetCategories();
  const { data: notes, isLoading } = useGetNotes({ categoryId: catId });

  const subCategory = categories?.find((c) => c.id === catId);
  const parentSection = categories?.find((c) => c.id === subCategory?.parentId);

  usePageTitle(subCategory ? `${subCategory.name}` : "القسم");

  const [view, setView] = useState<ViewMode>(getStoredView);

  const switchView = (v: ViewMode) => {
    setView(v);
    try { localStorage.setItem("notes_view", v); } catch {}
  };

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

      {/* Notes */}
      <section className="py-12 pb-24 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-xl border border-border/50 backdrop-blur-xl min-h-[400px]">

            {/* Header row */}
            <div className="flex items-center justify-between mb-8 gap-4">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Library className="w-6 h-6 text-primary" />
                الملازم
                <span className="text-sm text-muted-foreground font-normal bg-secondary/5 px-3 py-1 rounded-full ms-1">
                  {notes?.length || 0} ملزمة
                </span>
              </h2>

              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 bg-secondary/8 border border-border rounded-xl">
                <button
                  onClick={() => switchView("grid")}
                  title="عرض الشبكة"
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    view === "grid"
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/10"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => switchView("list")}
                  title="عرض القائمة"
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    view === "list"
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/10"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : notes && notes.length > 0 ? (
              view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {notes.map((note, idx) => (
                    <NoteCard key={note.id} note={note} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {notes.map((note, idx) => (
                    <NoteListCard key={note.id} note={note} index={idx} />
                  ))}
                </div>
              )
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
