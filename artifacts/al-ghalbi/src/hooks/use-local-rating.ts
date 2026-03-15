import { useState, useEffect } from "react";

export function useLocalRating(noteId: number) {
  const [hasRated, setHasRated] = useState(false);
  const [savedRating, setSavedRating] = useState<number | null>(null);
  const [fingerprint, setFingerprint] = useState<string>("");

  useEffect(() => {
    // Basic fingerprint logic (in real world, use a library or better uniqueness)
    const fp = btoa(`${navigator.userAgent}-${window.screen.width}x${window.screen.height}`);
    setFingerprint(fp);

    const storedKey = `rated_note_${noteId}`;
    const storedValue = localStorage.getItem(storedKey);
    if (storedValue) {
      setHasRated(true);
      setSavedRating(parseInt(storedValue, 10));
    }
  }, [noteId]);

  const saveRatingLocal = (rating: number) => {
    localStorage.setItem(`rated_note_${noteId}`, rating.toString());
    setHasRated(true);
    setSavedRating(rating);
  };

  return { hasRated, savedRating, fingerprint, saveRatingLocal };
}
