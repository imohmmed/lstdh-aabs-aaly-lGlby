import { useState } from "react";
import { Star } from "lucide-react";
import { useSubmitRating } from "@workspace/api-client-react";
import { useLocalRating } from "@/hooks/use-local-rating";
import { motion, AnimatePresence } from "framer-motion";

interface StarRatingProps {
  noteId: number;
}

export function StarRating({ noteId }: StarRatingProps) {
  const { hasRated, savedRating, fingerprint, saveRatingLocal } = useLocalRating(noteId);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitMutation = useSubmitRating();

  const handleRating = async (rating: number) => {
    if (hasRated || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        data: {
          noteId,
          rating,
          fingerprint
        }
      });
      saveRatingLocal(rating);
    } catch (error) {
      console.error("Failed to submit rating", error);
      // Even if API fails, optimistically save locally to prevent spam
      saveRatingLocal(rating);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasRated) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
        <div className="text-primary font-bold text-lg mb-3">شكراً لتقييمك!</div>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 ${star <= (savedRating || 0) ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-6 text-center">
      <h3 className="font-bold text-foreground mb-4">ما رأيك بهذه الملزمة؟</h3>
      <div 
        className="flex justify-center gap-2"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoverRating(star)}
            onClick={() => handleRating(star)}
            disabled={isSubmitting}
            className="focus:outline-none disabled:opacity-50 transition-colors"
          >
            <Star
              className={`w-10 h-10 transition-colors duration-200 ${
                star <= hoverRating
                  ? "fill-accent text-accent"
                  : "text-muted-foreground/30"
              }`}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
