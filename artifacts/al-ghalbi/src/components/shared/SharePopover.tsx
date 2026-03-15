import { Share2, MessageCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SharePopoverProps {
  noteTitle: string;
  url: string;
}

export function SharePopover({ noteTitle, url }: SharePopoverProps) {
  const text = `ملزمة ${noteTitle} - الأستاذ عباس علي الغالبي`;
  
  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} - ${url}`)}`, '_blank');
  };

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border shadow-sm flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/50 hover:bg-background transition-all z-10"
          title="مشاركة"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-card border-border shadow-xl rounded-2xl" align="start">
        <div className="flex flex-col gap-1 min-w-[140px]">
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-[#25D366]/10 text-[#25D366] transition-colors font-medium text-sm"
          >
            <MessageCircle className="w-5 h-5" />
            واتساب
          </button>
          <button
            onClick={handleTelegram}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-[#2AABEE]/10 text-[#2AABEE] transition-colors font-medium text-sm"
          >
            <SendIcon className="w-5 h-5" />
            تيليكرام
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Simple Send icon to represent Telegram since lucide's Send is slightly different, but it works
function SendIcon(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
