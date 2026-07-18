'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

/**
 * Cursor personalizado: dot blanco de 10px con mix-blend-mode difference.
 * Sigue el mouse 1:1 (sin lag) para no perder de vista el puntero real —
 * como reemplaza al cursor nativo (cursor:none en body), cualquier retraso
 * desorienta al usuario.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const dot = dotRef.current;
    if (!dot) return;

    let shown = false;
    const onMove = (e: MouseEvent) => {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      if (!shown) {
        shown = true;
        gsap.to(dot, { opacity: 1, duration: 0.4 });
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  });

  return (
    <div
      ref={dotRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 10,
        height: 10,
        marginTop: -5,
        marginLeft: -5,
        borderRadius: '50%',
        background: '#fff',
        mixBlendMode: 'difference',
        pointerEvents: 'none',
        zIndex: 10000,
        opacity: 0,
        willChange: 'transform',
      }}
    />
  );
}
