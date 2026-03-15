import { Link } from "wouter";
import { Star, Clock, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { Note } from "@workspace/api-client-react";
import { SharePopover } from "./SharePopover";
import { motion } from "framer-motion";

interface NoteCardProps {
  note: Note;
  index: number;
  compact?: boolean;
}

export function NoteCard({ note, index, compact = false }: NoteCardProps) {
  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/note/${note.id}` : '';
  const rating = note.averageRating ? Number(note.averageRating).toFixed(1) : "0.0";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group flex flex-col bg-card border border-border/60 shadow-md shadow-black/5 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 ${compact ? "rounded-2xl" : "rounded-[24px]"}`}
    >
      {/* Cover Image Container (A4 Ratio ~ 1:1.41) */}
      <div className="relative w-full aspect-[1/1.41] bg-secondary/5 overflow-hidden">
        {note.coverImageUrl ? (
          <img 
            src={note.coverImageUrl} 
            alt={note.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center bg-gradient-to-br from-secondary/10 to-background">
            <BookIcon className="w-16 h-16 mb-4 opacity-20" />
            <span className="font-display font-bold text-xl opacity-40">لا يوجد غلاف</span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top actions */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {!compact && (
            <Link
              href={note.categoryId ? `/category/${note.categoryId}` : "/"}
              className="bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm border border-border hover:bg-primary hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {note.categoryName || "عام"}
            </Link>
          )}
          {compact && <span />}
          {!compact && <SharePopover noteTitle={note.title} url={currentUrl} />}
        </div>
      </div>

      {/* Content */}
      {compact ? (
        <div className="p-2.5 flex flex-col flex-1">
          <h3 className="font-bold text-xs text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-snug">
            {note.title}
          </h3>
          {note.averageRating ? (
            <div className="flex items-center gap-0.5 text-accent mb-2">
              <Star className="w-3 h-3 fill-accent" />
              <span className="text-xs font-semibold">{rating}</span>
            </div>
          ) : null}
          <Link
            href={`/note/${note.id}`}
            className="mt-auto w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-300"
          >
            <Eye className="w-3 h-3" /> عرض
          </Link>
        </div>
      ) : (
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-lg text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {note.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            إعداد: {note.teacherName}
          </p>
          
          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-accent font-semibold">
              <Star className="w-4 h-4 fill-accent" />
              <span>{rating}</span>
              <span className="text-muted-foreground font-normal text-xs ms-1">({note.ratingCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{format(new Date(note.updatedAt), 'dd MMM yyyy', { locale: ar })}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <Link 
              href={`/note/${note.id}`}
              className="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300"
            >
              <Eye className="w-4 h-4" /> عرض
            </Link>
            <Link 
              href={`/note/${note.id}`}
              className="flex-1 bg-secondary hover:bg-secondary/90 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 shadow-md"
            >
              <Download className="w-4 h-4" /> تحميل
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function BookIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
