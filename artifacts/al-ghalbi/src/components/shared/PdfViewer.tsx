import { useState, useEffect } from "react";
import { Lock } from "lucide-react";

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsHidden(document.hidden);
    };

    const handleBlur = () => setIsHidden(true);
    const handleFocus = () => setIsHidden(false);

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div className="relative w-full aspect-[1/1.41] md:aspect-auto md:h-[800px] bg-secondary/5 rounded-2xl overflow-hidden border border-border shadow-inner">
      {/* Protection Overlay */}
      {isHidden && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-white/50" />
          </div>
          <h3 className="text-2xl font-bold mb-2">عرض محمي</h3>
          <p className="text-white/60 max-w-sm">
            تم إخفاء المحتوى لحمايته من التقاط الشاشة. يرجى العودة للتطبيق لمتابعة القراءة.
          </p>
        </div>
      )}

      {/* The iframe with pointer-events disabled for protection against easy right click -> save as, though not bulletproof */}
      <iframe
        src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
        className="w-full h-full border-0 select-none"
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* Invisible overlay to prevent interaction with PDF controls if any leak through */}
      <div 
        className="absolute inset-0 z-10" 
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
