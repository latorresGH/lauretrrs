'use client';

import { useEffect, useRef } from 'react';
import content from '@/data/content.json';
import { useLanguage } from '@/lib/language';
import { useContactModal } from '@/lib/contact-modal';
import { gsap } from '@/lib/gsap';

/**
 * Botón "Contactemos" — compartido por el Nav y el Hero para que sean idénticos.
 * Magnético: deriva hacia el cursor y vuelve elástico. Abre el modal de contacto.
 */
export default function ContactButton() {
  const { t } = useLanguage();
  const { open } = useContactModal();
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const btn = ref.current;
    if (!btn) return;
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
      gsap.to(btn, { scale: 1.05, duration: 0.4, ease: 'power3.out' });
      const arrow = btn.querySelector('.cta-arrow');
      if (arrow) gsap.to(arrow, { x: 3, y: -3, duration: 0.4, ease: 'power3.out' });
    };
    const onLeave = () => {
      gsap.to(btn, { x: 0, y: 0, scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)' });
      const arrow = btn.querySelector('.cta-arrow');
      if (arrow) gsap.to(arrow, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' });
    };
    btn.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
    return () => {
      btn.removeEventListener('mousemove', onMove);
      btn.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <a
      ref={ref}
      href="#contacto"
      className="nav-cta"
      onClick={(e) => {
        e.preventDefault();
        open();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px 9px 16px',
        background: '#4a4a4a',
        color: '#f4f3f1',
        fontFamily: 'var(--font-main)',
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        textTransform: 'none',
        willChange: 'transform',
      }}
    >
      {t(content.ctaLabel)}
      <span className="cta-arrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: '#f4f3f1', color: '#1a1a1a', willChange: 'transform' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 9.5L9.5 2.5M9.5 2.5H3.5M9.5 2.5V8.5" stroke="#1a1a1a" strokeWidth="1.6" />
        </svg>
      </span>
    </a>
  );
}
