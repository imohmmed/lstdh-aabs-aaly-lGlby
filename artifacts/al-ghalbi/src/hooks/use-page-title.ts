import { useEffect } from "react";

const SITE = "الأستاذ عباس علي الغالبي";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : SITE;
    return () => {
      document.title = SITE;
    };
  }, [title]);
}
