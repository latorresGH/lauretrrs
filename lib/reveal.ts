'use client';

import { useEffect, type RefObject } from 'react';
import { gsap } from './gsap';

/**
 * Reveal-on-scroll one-shot dentro de un scope.
 *  - `[data-up]`      → fade + translateY (texto)
 *  - `[data-img]`     → clip-path wipe + scale del hijo (imágenes)
 *  - `[data-mask]`    → wipe vertical (clip-path) + rise (títulos grandes)
 *  - `[data-letters]` → cada letra sube con stagger (títulos display)
 * Reemplaza los ticks self-healing del HTML original (que existían por el
 * re-render del editor en vivo, innecesario en React).
 */
export function useRevealOnScroll(scopeRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const ups = Array.from(scope.querySelectorAll<HTMLElement>('[data-up]'));
    const imgs = Array.from(scope.querySelectorAll<HTMLElement>('[data-img]'));
    const masks = Array.from(scope.querySelectorAll<HTMLElement>('[data-mask]'));
    const letterEls = Array.from(scope.querySelectorAll<HTMLElement>('[data-letters]'));

    ups.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(50px)';
    });
    imgs.forEach((el) => {
      el.style.opacity = '0';
    });
    masks.forEach((el) => {
      el.style.opacity = '0';
    });
    // parte cada título en letras (span inline-block) y las deja ocultas abajo
    letterEls.forEach((el) => {
      if (!el.dataset.split) {
        el.dataset.split = '1';
        const text = el.textContent ?? '';
        el.textContent = '';
        for (const ch of text) {
          const s = document.createElement('span');
          s.className = 'rv-letter';
          s.textContent = ch === ' ' ? ' ' : ch;
          s.style.display = 'inline-block';
          s.style.willChange = 'transform';
          el.appendChild(s);
        }
      }
      gsap.set(el.querySelectorAll('.rv-letter'), { yPercent: 115, opacity: 0 });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);

          if (el.hasAttribute('data-img')) {
            gsap.set(el, { opacity: 1, y: 0 });
            gsap.fromTo(
              el,
              { clipPath: 'inset(100% 0% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power4.inOut' },
            );
            const inner = el.firstElementChild;
            if (inner) gsap.fromTo(inner, { scale: 1.28 }, { scale: 1, duration: 2.2, ease: 'power3.out' });
          } else if (el.hasAttribute('data-letters')) {
            gsap.to(el.querySelectorAll('.rv-letter'), {
              yPercent: 0,
              opacity: 1,
              duration: 0.9,
              ease: 'power4.out',
              stagger: 0.035,
            });
          } else if (el.hasAttribute('data-mask')) {
            gsap.set(el, { opacity: 1 });
            gsap.fromTo(
              el,
              { clipPath: 'inset(105% 0% 0% 0%)', yPercent: 14 },
              { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 1.25, ease: 'power4.out' },
            );
          } else {
            gsap.to(el, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out' });
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px' },
    );

    [...ups, ...imgs, ...masks, ...letterEls].forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [scopeRef]);
}
