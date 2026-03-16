import { Link } from "wouter";
import { Star, Clock, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { Note } from "@workspace/api-client-react";
import { SharePopover } from "./SharePopover";
import { motion } from "framer-motion";

interface NoteListCardProps {
  note: Note;
  index: number;
}

export function NoteListCard({ note, index }: NoteListCardProps) {
  const currentUrl = typeof window !== "undefined"
    ? `${window.location.origin}/note/${note.id}`
    : "";
  const rating = note.averageRating ? Number(note.averageRating).toFixed(1) : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group flex flex-row bg-card rounded-2xl border border-border/60 shadow-md shadow-black/5 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
    >
      {/* Cover — right side (RTL start) */}
      <div className="relative flex-shrink-0 w-20 sm:w-32 md:w-44 bg-secondary/5 overflow-hidden">
        {note.coverImageUrl ? (
          <img
            src={note.coverImageUrl}
            alt={note.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ aspectRatio: "unset" }}
          />
        ) : (
          <div className="w-full h-full min-h-[120px] flex items-center justify-center text-muted-foreground bg-gradient-to-br from-secondary/10 to-background">
            <BookIcon className="w-10 h-10 opacity-20" />
          </div>
        )}
        {/* Category badge */}
        <Link
          href={note.categoryId ? `/category/${note.categoryId}` : "/"}
          className="absolute top-2 start-2 bg-background/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold text-primary shadow-sm border border-border hover:bg-primary hover:text-white transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {note.categoryName || "عام"}
        </Link>
      </div>

      {/* Content — left side */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-base sm:text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {note.title}
          </h3>
          <div className="flex-shrink-0">
            <SharePopover noteTitle={note.title} url={currentUrl} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          إعداد: {note.teacherName}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1 text-accent font-semibold">
            <Star className="w-3.5 h-3.5 fill-accent" />
            <span>{rating}</span>
            <span className="text-muted-foreground font-normal ms-0.5">({note.ratingCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{format(new Date(note.updatedAt), "dd MMM yyyy", { locale: ar })}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/note/${note.id}`}
            className="flex-1 sm:flex-none bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300"
          >
            <Eye className="w-4 h-4" /> عرض
          </Link>
          {note.telegramDownloadUrl ? (
            <a
              href={note.telegramDownloadUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 sm:flex-none bg-secondary hover:bg-secondary/90 text-white flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-md"
            >
              <Download className="w-4 h-4" /> تحميل
            </a>
          ) : (
            <span className="flex-1 sm:flex-none bg-secondary/50 text-white/60 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed">
              <Download className="w-4 h-4" /> تحميل
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
