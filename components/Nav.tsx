'use client';

import { useEffect, useRef } from 'react';
import content from '@/data/content.json';
import { useLanguage } from '@/lib/language';
import ContactButton from './ContactButton';
import { useLenis } from '@/lib/lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Nav — port fiel del HTML: grid de 3 columnas (logo · links · CTA), fija a
 * top, mix-blend-mode difference, con data-reveal para el reveal inicial.
 * Mantiene el toggle ES/EN del spec.
 */
export default function Nav() {
  const { t, lang, toggle } = useLanguage();
  const lenis = useLenis();
  const navRef = useRef<HTMLElement>(null);

  // --- links del header: scrollea a la sección con Lenis, restando la altura
  // del nav fijo así el título de destino no queda tapado ---
  const onNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 0;
    const offset = -(navBottom + 16);
    if (lenis) {
      lenis.scrollTo(target as HTMLElement, { offset });
    } else {
      const y = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // --- el header aparece recién al llegar a la segunda sección (#folio-scene) ---
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const st = ScrollTrigger.create({
      trigger: '#folio-scene',
      start: 'top 15%',
      end: 'max',
      onToggle: (self) =>
        gsap.to(nav, {
          autoAlpha: self.isActive ? 1 : 0,
          y: self.isActive ? 0 : 30,
          duration: 0.8,
          ease: 'power3.out',
          overwrite: 'auto',
        }),
    });
    return () => st.kill();
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
      ref={navRef}
      className="site-nav"
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
        visibility: 'hidden',
        transform: 'translateY(30px)',
        pointerEvents: 'auto',
        mixBlendMode: 'difference',
      }}
    >
      {/* logo — wordmark LAURE */}
      <a
        href="#me"
        id="logo"
        onClick={(e) => onNavLinkClick(e, '#me')}
        style={{ justifySelf: 'start', fontFamily: 'var(--font-animo600), var(--font-main)', fontWeight: 400, fontSize: 27, lineHeight: 1, letterSpacing: '-0.065em', textTransform: 'uppercase', color: '#f4f3f1' }}
      >
        Laure
      </a>

      {/* links */}
      <div className="nav-links" style={{ display: 'flex', gap: 20, alignItems: 'center', justifySelf: 'center', paddingRight: '20vw', fontSize: 24 }}>
        {content.nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => onNavLinkClick(e, item.href)}
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
      <div className="nav-right" style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={toggle} aria-label="Toggle language" style={{ color: '#8a8a8a', fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {lang === 'es' ? 'EN' : 'ES'}
        </button>
        <ContactButton />
      </div>
    </nav>
  );
}
