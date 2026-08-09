import { type RefObject, useEffect } from "react";

export function useIntersectionObserver(
  targetRef: RefObject<Element | null>,
  onIntersect: () => void,
  options?: IntersectionObserverInit,
) {
  useEffect(() => {
    const target = targetRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) onIntersect();
    }, options);

    observer.observe(target);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, onIntersect]);
}
