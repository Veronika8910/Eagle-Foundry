import { type MutableRefObject, type PointerEvent, useCallback, useRef } from 'react';

export function useEfCardPointer<T extends HTMLElement>(): {
  rootRef: MutableRefObject<T | null>;
  onPointerMove: (event: PointerEvent<T>) => void;
} {
  const rootRef = useRef<T | null>(null);
  const cardsRef = useRef<HTMLElement[] | null>(null);

  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    if (!cardsRef.current && rootRef.current) {
      cardsRef.current = Array.from(rootRef.current.querySelectorAll<HTMLElement>('.ef-card'));
    }

    const cards = cardsRef.current ?? [];

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', `${event.clientX - rect.left}`);
      card.style.setProperty('--y', `${event.clientY - rect.top}`);
    });
  }, []);

  return { rootRef, onPointerMove };
}
