import { useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetNoteById, useGetSimilarNotes, useRecordEvent } from "@workspace/api-client-react";
import { PdfViewer } from "@/components/shared/PdfViewer";
import { StarRating } from "@/components/shared/StarRating";
import { SharePopover } from "@/components/shared/SharePopover";
import { NoteCard } from "@/components/shared/NoteCard";
import { Download, FileText, Info, Eye, ArrowRight, Loader2, HardDrive } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { usePageTitle } from "@/hooks/use-page-title";

export default function NoteDetail() {
  const { id } = useParams();
  const noteId = parseInt(id || "0", 10);
  const [showPdf, setShowPdf] = useState(false);
  const pdfSectionRef = useRef<HTMLDivElement>(null);
  
  const { data: note, isLoading, isError } = useGetNoteById(noteId);
  const { data: similarNotes } = useGetSimilarNotes(noteId);
  const recordEvent = useRecordEvent();

  usePageTitle(note?.title);

  // Record view on mount
  useEffect(() => {
    if (noteId && note) {
      recordEvent.mutateAsync({ data: { noteId, eventType: "view" } }).catch(() => {});
    }
  }, [noteId, !!note]);

  const handleShowPdf = () => {
    setShowPdf(true);
    recordEvent.mutateAsync({ data: { noteId, eventType: "preview_click" } }).catch(() => {});
    setTimeout(() => {
      pdfSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleDownloadClick = () => {
    recordEvent.mutateAsync({ data: { noteId, eventType: "download_click" } }).catch(() => {});
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !note) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold mb-4">الملزمة غير موجودة</h2>
          <Link href="/" className="text-primary hover:underline flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> العودة للرئيسية
          </Link>
        </div>
      </AppLayout>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <AppLayout>
      {/* Breadcrumb & Back */}
      <div className="bg-secondary text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-1">
            <ArrowRight className="w-4 h-4" /> الرئيسية
          </Link>
          <span className="text-white/30">/</span>
          <Link href={`/category/${note.categoryId}`} className="text-white/60 hover:text-white transition-colors">{note.categoryName || "عام"}</Link>
          <span className="text-white/30">/</span>
          <span className="text-white truncate max-w-[200px]">{note.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Right Column - Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Cover Card */}
            <div className="bg-card rounded-3xl p-4 shadow-xl border border-border/50 relative">
              <div className="absolute top-8 left-8 z-10">
                <SharePopover noteTitle={note.title} url={currentUrl} />
              </div>
              
              <div className="w-full aspect-[1/1.41] rounded-2xl overflow-hidden bg-secondary/5 mb-6 shadow-inner">
                {note.coverImageUrl ? (
                  <img src={note.coverImageUrl} alt={note.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <FileText className="w-20 h-20 opacity-20" />
                  </div>
                )}
              </div>
              
              <div className="px-2 pb-2">
                <Link href={`/category/${note.categoryId}`} className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mb-3 hover:bg-primary hover:text-white transition-colors">
                  {note.categoryName}
                </Link>
                <h1 className="font-display text-2xl font-bold text-foreground mb-2 leading-tight">
                  {note.title}
                </h1>
                <p className="text-muted-foreground font-medium mb-6">
                  إعداد: {note.teacherName}
                </p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-secondary/5 p-3 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground mb-1">الإصدار</div>
                    <div className="font-bold text-foreground text-sm truncate">{note.version || "غير محدد"}</div>
                  </div>
                  <div className="bg-secondary/5 p-3 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground mb-1">الصفحات</div>
                    <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      {note.pageCount || "؟"} صفحة
                    </div>
                  </div>
                  <div className="bg-secondary/5 p-3 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground mb-1">الحجم</div>
                    <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-primary" />
                      {note.fileSize || "؟ MB"}
                    </div>
                  </div>
                  <div className="bg-secondary/5 p-3 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground mb-1">تاريخ الرفع</div>
                    <div className="font-bold text-foreground text-sm">
                      {format(new Date(note.createdAt), 'yyyy/MM/dd')}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!showPdf && note.pdfUrl && (
                    <button 
                      onClick={handleShowPdf}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                      <Eye className="w-5 h-5" /> عرض الملزمة (PDF)
                    </button>
                  )}
                  
                  {note.telegramDownloadUrl && (
                    <a 
                      href={note.telegramDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleDownloadClick}
                      className="w-full bg-[#2AABEE] hover:bg-[#2AABEE]/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#2AABEE]/20"
                    >
                      <Download className="w-5 h-5" /> تحميل عبر تيليكرام
                    </a>
                  )}

                  {note.telegramPurchaseUrl && (
                    <a 
                      href={note.telegramPurchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/20 mt-4"
                    >
                      <Info className="w-5 h-5" /> شراء النسخة الأصلية (ملازم)
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <StarRating noteId={note.id} />
          </div>

          {/* Left Column - PDF Viewer & Content */}
          <div ref={pdfSectionRef} className="lg:col-span-8 space-y-12">
            {showPdf && note.pdfUrl ? (
              <div className="bg-card rounded-3xl p-2 md:p-6 shadow-xl border border-border/50">
                <div className="flex items-center justify-between mb-6 px-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <FileText className="text-primary w-5 h-5" /> العرض المباشر
                  </h3>
                  <button 
                    onClick={() => setShowPdf(false)}
                    className="text-sm text-muted-foreground hover:text-foreground font-medium bg-secondary/10 px-4 py-2 rounded-lg transition-colors"
                  >
                    إغلاق العارض
                  </button>
                </div>
                <PdfViewer url={note.pdfUrl} />
              </div>
            ) : (
              <div className="bg-card rounded-3xl p-12 shadow-xl border border-border/50 text-center flex flex-col items-center justify-center min-h-[500px] border-dashed">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-12 h-12 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">جاهز للعرض؟</h3>
                <p className="text-muted-foreground max-w-md text-lg mb-8 text-balance">
                  الملزمة محمية بنظام خاص يمنع التقاط الشاشة للحفاظ على حقوق النشر.
                </p>
                {note.pdfUrl ? (
                  <button 
                    onClick={handleShowPdf}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 transition-all shadow-lg shadow-primary/20 text-lg"
                  >
                    <Eye className="w-6 h-6" /> ابدأ القراءة الآن
                  </button>
                ) : (
                  <div className="bg-destructive/10 text-destructive px-6 py-3 rounded-xl font-bold">
                    لم يتم رفع ملف PDF لهذه الملزمة بعد
                  </div>
                )}
              </div>
            )}

            {/* Similar Notes */}
            {similarNotes && similarNotes.length > 0 && (
              <div className="pt-8 border-t border-border">
                <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
                  ملازم مشابهة في {note.categoryName}
                  <div className="h-1.5 w-8 bg-primary rounded-full" />
                </h3>
                
                <div className="flex overflow-x-auto pb-8 -mx-4 px-4 snap-x gap-6 no-scrollbar">
                  {similarNotes.map((similar, idx) => (
                    <div key={similar.id} className="min-w-[280px] w-[280px] snap-start shrink-0">
                      <NoteCard note={similar} index={idx} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
