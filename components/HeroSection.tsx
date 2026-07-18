'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { gsap, useGSAP } from '@/lib/gsap';
import { useLanguage } from '@/lib/language';
import Nav from './Nav';
import FolioScene from './FolioScene';

const HeroParticles = dynamic(() => import('./HeroParticles'), { ssr: false });

const GRAIN_BG =
  "url('data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3CfeColorMatrix type=%22saturate%22 values=%220%22/%3E%3C/filter%3E%3Crect width=%22300%22 height=%22300%22 filter=%22url(%23n)%22 opacity=%220.55%22/%3E%3C/svg%3E')";

/**
 * Hero — port fiel del HTML. Layout editorial: "Form &" arriba-izquierda,
 * "Motion" abajo-derecha, meta row, y bloque About abajo-izquierda que aparece
 * cerca del final del scroll (los titulares se retiran hacia arriba).
 *
 * El #scroll-root (500vh) contiene el #hero-root (sticky) y, anidado, el
 * FolioScene (absolute) que sube por encima en el último tramo. La convergencia
 * PORT/FOLIO y el brillo/parallax del hero los maneja FolioScene.
 */
export default function HeroSection() {
  const { t } = useLanguage();
  const scopeRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const descShown = useRef(false);

  // Reveal secuencial inicial (nav, Form &, Motion, meta) — data-reveal
  useGSAP(
    () => {
      gsap.to('[data-reveal]', {
        opacity: 1,
        y: 0,
        duration: 1.3,
        ease: 'power3.out',
        stagger: 0.13,
        delay: 0.2,
      });
    },
    { scope: scopeRef },
  );

  // Swap titulares ↔ descripción según el progreso de las partículas
  const handleProgress = (p: number) => {
    const descEls = aboutRef.current?.querySelectorAll('[data-desc]');
    const heads = [line1Ref.current, line2Ref.current].filter(Boolean);
    if (!descEls) return;

    if (p > 0.88 && !descShown.current) {
      descShown.current = true;
      gsap.to(descEls, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', stagger: 0.13 });
      gsap.to(heads, { opacity: 0, y: -40, duration: 0.9, ease: 'power2.out', stagger: 0.08 });
    } else if (p < 0.78 && descShown.current) {
      descShown.current = false;
      gsap.to(descEls, { opacity: 0, y: 40, duration: 0.7, ease: 'power2.in', stagger: 0.06 });
      gsap.to(heads, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08 });
    }
  };

  const headlineStyle: React.CSSProperties = {
    fontWeight: 800,
    fontSize: 'clamp(64px, 9.5vw, 164px)',
    lineHeight: 0.94,
    letterSpacing: '-0.045em',
    textTransform: 'uppercase',
    color: '#f4f3f1',
  };

  return (
    <div
      id="me"
      ref={scopeRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '500vh',
        background: '#090906',
        fontFamily: 'var(--font-main)',
        color: '#f4f3f1',
      }}
    >
      <div
        id="hero-root"
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          minHeight: 700,
          overflow: 'hidden',
          boxSizing: 'border-box',
          backgroundColor: '#090906',
        }}
      >
        {/* particle stage */}
        <div id="stage-frame" style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#090906' }}>
          <HeroParticles onProgress={handleProgress} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 140px rgba(5, 5, 5, 0.55)' }} />

          {/* About — reveal cerca del final */}
          <div
            id="about-block"
            ref={aboutRef}
            style={{
              position: 'absolute',
              left: 'clamp(28px, 5vw, 80px)',
              bottom: 'clamp(28px, 8vh, 90px)',
              maxWidth: 640,
              zIndex: 2,
            }}
          >
            <div
              data-desc
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#8a8a8a',
                marginBottom: 18,
                opacity: 0,
                transform: 'translateY(40px)',
              }}
            >
              {t({ es: 'Acerca', en: 'About' })}
            </div>
            <div
              data-desc
              style={{
                fontWeight: 700,
                fontSize: 'clamp(24px, 2.5vw, 40px)',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                color: '#f4f3f1',
                opacity: 0,
                transform: 'translateY(40px)',
              }}
            >
              {t({
                es: 'Soy Laureano — desarrollador y diseñador independiente que crea experiencias digitales donde la forma se encuentra con el movimiento.',
                en: "I'm Laureano — an independent designer & developer crafting digital experiences where form meets motion.",
              })}
            </div>
            <div
              data-desc
              style={{ marginTop: 18, fontWeight: 500, fontSize: 15, color: '#9a9a9a', opacity: 0, transform: 'translateY(40px)' }}
            >
              {t({ es: 'Basado en Santa Fe. Trabajo a nivel mundial.', en: 'Based in Santa Fe. Working worldwide.' })}
            </div>
          </div>
        </div>

        {/* content */}
        <div
          className="hero-content"
          style={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            boxSizing: 'border-box',
            padding: '32px 48px',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'none',
          }}
        >
          <h1 id="headline-top" className="hero-line" style={{ margin: 'clamp(64px, 8vh, 96px) 0 0', marginLeft: 35, ...headlineStyle }}>
            <span ref={line1Ref} data-reveal style={{ display: 'block', opacity: 0, transform: 'translateY(60px)' }}>
              {t({ es: 'Forma &', en: 'Form &' })}
            </span>
          </h1>

          <div style={{ flex: 1, minHeight: 0 }} />

          <div id="headline-bottom" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span
              ref={line2Ref}
              data-reveal
              className="hero-line"
              style={{ display: 'block', opacity: 0, transform: 'translateY(60px)', marginLeft: 35, marginRight: 35, ...headlineStyle }}
            >
              {t({ es: 'Movimiento', en: 'Motion' })}
            </span>
          </div>

          <div
            className="hero-meta"
            data-reveal
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginTop: 20,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: '#f4f3f1',
              opacity: 0,
              transform: 'translateY(30px)',
            }}
          >
            <span>©2026</span>
            <span>Santa Fe, AR</span>
            <span>Showreel 01</span>
          </div>
        </div>

        {/* grain */}
        <div
          id="grain-layer"
          style={{
            position: 'absolute',
            inset: '-10%',
            zIndex: 3,
            pointerEvents: 'none',
            opacity: 0.08,
            animation: 'grainShift 1.2s steps(6) infinite',
            backgroundImage: GRAIN_BG,
            backgroundSize: '300px 300px',
          }}
        />

        {/* darkening veil */}
        <div id="hero-dim" style={{ position: 'absolute', inset: 0, zIndex: 5, background: '#000', opacity: 0, pointerEvents: 'none', willChange: 'opacity' }} />
      </div>

      {/* nav — fija, a nivel de scroll-root */}
      <Nav />

      {/* PORT / FOLIO — sube por encima del hero en el último tramo */}
      <FolioScene />
    </div>
  );
}
