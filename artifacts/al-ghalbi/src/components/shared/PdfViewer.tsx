import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2, AlertCircle } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
}

// A single lazy page that only renders its canvas when visible
function LazyPage({
  pageNum,
  width,
  numPages,
}: {
  pageNum: number;
  width: number;
  numPages: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const height = Math.round(width * 1.414);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-xl shadow-md border border-border"
      style={{ minHeight: height }}
    >
      {visible ? (
        <Page
          pageNumber={pageNum}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={
            <div
              style={{ width, height }}
              className="bg-secondary/5 flex items-center justify-center"
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
            </div>
          }
        />
      ) : (
        <div
          style={{ width, height }}
          className="bg-secondary/5 flex items-center justify-center"
        >
          <Loader2 className="w-5 h-5 animate-spin text-primary/20" />
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/30 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
        {pageNum} / {numPages}
      </div>
    </div>
  );
}

export function PdfViewer({ url }: PdfViewerProps) {
  const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth - 16);
    }
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {isLoading && !hasError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium">جاري تحميل الملزمة...</p>
        </div>
      )}

      {hasError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-destructive">
          <AlertCircle className="w-10 h-10" />
          <p className="font-bold">تعذّر تحميل الملف</p>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            تأكد من أن رابط الـ PDF صحيح وأن الخادم يسمح بالوصول إليه.
          </p>
        </div>
      )}

      {!isLoading && !hasError && numPages > 0 && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
            {numPages} صفحة
          </span>
        </div>
      )}

      <Document
        file={absoluteUrl}
        onLoadSuccess={({ numPages }) => { setNumPages(numPages); setIsLoading(false); }}
        onLoadError={() => { setHasError(true); setIsLoading(false); }}
        loading={null}
        error={null}
      >
        <div className="space-y-3">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <LazyPage
              key={pageNum}
              pageNum={pageNum}
              width={containerWidth}
              numPages={numPages}
            />
          ))}
        </div>
      </Document>
    </div>
  );
}
