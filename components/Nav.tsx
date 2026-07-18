'use client';

import { useEffect, useRef } from 'react';
import content from '@/data/content.json';
import { useLanguage } from '@/lib/language';
import { useContactModal } from '@/lib/contact-modal';
import { gsap } from '@/lib/gsap';

/**
 * Nav — port fiel del HTML: grid de 3 columnas (logo · links · CTA), fija a
 * top, mix-blend-mode difference, con data-reveal para el reveal inicial.
 * Mantiene el toggle ES/EN del spec.
 */
export default function Nav() {
  const { t, lang, toggle } = useLanguage();
  const { open: openContactModal } = useContactModal();
  const logoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // --- L de puntitos: los puntos se dispersan al acercarse el cursor ---
  useEffect(() => {
    const logo = logoRef.current;
    if (!logo || logo.dataset.built) return;
    logo.dataset.built = '1';

    const lPos: [number, number][] = [];
    // trazo vertical
    for (let y = 0; y <= 38.4; y += 2.4) {
      lPos.push([4, y], [6.4, y], [8.8, y]);
    }
    // pie horizontal — arranca pasado el trazo para que la esquina lea limpia
    for (let x = 11.2; x <= 33; x += 2.4) {
      lPos.push([x, 33.6], [x, 36], [x, 38.4]);
    }

    const dots = lPos.map(([x, y]) => {
      const d = document.createElement('div');
      d.style.cssText =
        'position:absolute;left:0;top:0;width:1.8px;height:1.8px;border-radius:50%;background:#f4f3f1;';
      gsap.set(d, { x, y });
      logo.appendChild(d);
      return d;
    });

    const onMove = (e: MouseEvent) => {
      const rect = logo.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      dots.forEach((d, i) => {
        const [hx, hy] = lPos[i];
        const dx = hx - mx;
        const dy = hy - my;
        const dist = Math.max(Math.hypot(dx, dy), 1);
        const radius = 26;
        if (dist < radius) {
          const push = (1 - dist / radius) * 20;
          gsap.to(d, {
            x: hx + (dx / dist) * push,
            y: hy + (dy / dist) * push,
            duration: 0.4,
            ease: 'power2.out',
          });
        } else {
          gsap.to(d, { x: hx, y: hy, duration: 0.8, ease: 'power3.out' });
        }
      });
    };
    const onLeave = () =>
      dots.forEach((d, i) => {
        gsap.to(d, {
          x: lPos[i][0],
          y: lPos[i][1],
          duration: 1.2,
          ease: 'elastic.out(1, 0.55)',
          delay: i * 0.006,
        });
      });

    logo.addEventListener('mousemove', onMove);
    logo.addEventListener('mouseleave', onLeave);
    return () => {
      logo.removeEventListener('mousemove', onMove);
      logo.removeEventListener('mouseleave', onLeave);
      dots.forEach((d) => d.remove());
      delete logo.dataset.built;
    };
  }, []);

  // --- botón "Contactemos": magnético — deriva hacia el cursor y vuelve elástico ---
  useEffect(() => {
    const btn = ctaRef.current;
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

  // --- links del header: el fondo se rellena de izquierda a derecha al hover
  // (crema cálido, igual que el hover del FAQ) y el texto se invierte a oscuro ---
  const onLinkEnter = (e: React.MouseEvent<HTMLElement>) => {
    const fill = e.currentTarget.querySelector('.nav-fill');
    const label = e.currentTarget.querySelector('.nav-label');
    if (fill) gsap.to(fill, { scaleX: 1, transformOrigin: 'left center', duration: 0.45, ease: 'power3.out' });
    if (label) gsap.to(label, { color: '#090906', duration: 0.45, ease: 'power3.out' });
  };
  const onLinkLeave = (e: React.MouseEvent<HTMLElement>) => {
    const fill = e.currentTarget.querySelector('.nav-fill');
    const label = e.currentTarget.querySelector('.nav-label');
    if (fill) gsap.to(fill, { scaleX: 0, transformOrigin: 'right center', duration: 0.45, ease: 'power3.out' });
    if (label) gsap.to(label, { color: '#f4f3f1', duration: 0.45, ease: 'power3.out' });
  };

  return (
    <nav
      data-reveal
      style={{
        position: 'fixed',
        top: 32,
        left: 48,
        right: 48,
        zIndex: 60,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        opacity: 0,
        transform: 'translateY(30px)',
        pointerEvents: 'auto',
        mixBlendMode: 'difference',
      }}
    >
      {/* logo — la "L" es un campo de puntitos que se dispersa con el cursor */}
      <div ref={logoRef} id="logo" style={{ position: 'relative', width: 40, height: 44, justifySelf: 'start' }}>
        <span style={{ position: 'absolute', right: -12, top: -4, fontSize: 16, color: '#f4f3f1' }}>™</span>
      </div>

      {/* links */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifySelf: 'center', paddingRight: '20vw', fontSize: 24 }}>
        {content.nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onMouseEnter={onLinkEnter}
            onMouseLeave={onLinkLeave}
            style={{ position: 'relative', color: '#f4f3f1', padding: '4px 14px', overflow: 'hidden' }}
          >
            <span
              className="nav-fill"
              style={{ position: 'absolute', inset: 0, background: '#f4efe4', mixBlendMode: 'normal', transform: 'scaleX(0)', transformOrigin: 'left center', pointerEvents: 'none', zIndex: 0 }}
            />
            <span className="nav-label" style={{ position: 'relative', zIndex: 1 }}>{t(item.label)}</span>
          </a>
        ))}
      </div>

      {/* derecha — toggle idioma + CTA magnético */}
      <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={toggle} aria-label="Toggle language" style={{ color: '#8a8a8a', fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {lang === 'es' ? 'EN' : 'ES'}
        </button>
        <a
          ref={ctaRef}
          href="#contacto"
          onClick={(e) => {
            e.preventDefault();
            openContactModal();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px 9px 16px',
            background: '#4a4a4a',
            color: '#f4f3f1',
            fontSize: 16,
            fontWeight: 700,
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
      </div>
    </nav>
  );
}
