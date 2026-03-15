import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Lock, ChevronRight, ChevronLeft, Loader2, AlertCircle } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 16);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const hide = () => setIsHidden(true);
    const show = () => setIsHidden(false);
    const onVis = () => setIsHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className="relative w-full select-none" ref={containerRef}>
      {/* Screenshot protection overlay */}
      {isHidden && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-white p-6 text-center rounded-2xl">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-white/50" />
          </div>
          <h3 className="text-2xl font-bold mb-2">عرض محمي</h3>
          <p className="text-white/60 max-w-sm">
            تم إخفاء المحتوى لحمايته. يرجى العودة للتطبيق لمتابعة القراءة.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !hasError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium">جاري تحميل الملزمة...</p>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-destructive">
          <AlertCircle className="w-10 h-10" />
          <p className="font-bold">تعذّر تحميل الملف</p>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            تأكد من أن رابط الـ PDF صحيح وأن الخادم يسمح بالوصول إليه.
          </p>
        </div>
      )}

      {/* Page counter badge */}
      {!isLoading && !hasError && numPages > 0 && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
            {numPages} صفحة
          </span>
        </div>
      )}

      {/* PDF Document - all pages stacked */}
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
        error={null}
      >
        <div className="space-y-3">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div
              key={pageNum}
              className="relative overflow-hidden rounded-xl shadow-md border border-border"
            >
              <Page
                pageNumber={pageNum}
                width={containerWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div
                    style={{ width: containerWidth, height: containerWidth * 1.41 }}
                    className="bg-secondary/5 flex items-center justify-center"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                  </div>
                }
              />
              {/* Per-page watermark overlay */}
              <div
                className="absolute inset-0 pointer-events-none select-none"
                style={{ zIndex: 5 }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-[0.04]"
                  style={{
                    fontSize: containerWidth * 0.045,
                    fontWeight: "bold",
                    color: "#000",
                    transform: "rotate(-35deg)",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  الأستاذ عباس علي الغالبي
                </div>
              </div>
              {/* Page number */}
              <div className="absolute bottom-2 left-2 bg-black/30 text-white text-xs px-2 py-0.5 rounded-full select-none" style={{ zIndex: 6 }}>
                {pageNum} / {numPages}
              </div>
            </div>
          ))}
        </div>
      </Document>
    </div>
  );
}
