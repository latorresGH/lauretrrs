'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useRevealOnScroll } from '@/lib/reveal';
import { useLanguage, type Localized } from '@/lib/language';
import { useLenis } from '@/lib/lenis';
import Photo from './Photo';

const STORIES: { q: Localized; r: Localized }[] = [
  {
    q: {
      es: '"El e-commerce quedó rápido, claro y fácil de administrar. Las ventas online arrancaron la primera semana."',
      en: '"The e-commerce site turned out fast, clear and easy to manage. Online sales kicked off in the first week."',
    },
    r: { es: 'Cliente, AfterPanch', en: 'Client, AfterPanch' },
  },
  {
    q: {
      es: '"Nos ordenó el catálogo completo y el checkout es simple. Los clientes encuentran todo sin preguntar."',
      en: '"He organized our entire catalog and checkout is simple. Customers find everything without having to ask."',
    },
    r: { es: 'Cliente, Tienda de Perfumes', en: 'Client, Perfume Store' },
  },
  {
    q: {
      es: '"Entendió el negocio enseguida y propuso mejoras que no habíamos pedido. El sitio se mantiene solo."',
      en: '"He understood the business right away and suggested improvements we hadn\'t asked for. The site runs itself."',
    },
    r: { es: 'Cliente, Stickeando', en: 'Client, Stickeando' },
  },
  {
    q: {
      es: '"El turnero nos sacó las filas del mostrador: la gente saca su número y el equipo atiende en orden."',
      en: '"The queue system got rid of the lines at the counter: people take a number and the team serves them in order."',
    },
    r: { es: 'Farmacia, sistema de turnos', en: 'Pharmacy, queue system' },
  },
  {
    q: {
      es: '"Los pedidos llegan ordenados y los reportes salen solos. Ahorramos horas de gestión todas las semanas."',
      en: '"Orders come in organized and reports generate themselves. We save hours of management every week."',
    },
    r: { es: 'Local gastronómico, SaaS de pedidos', en: 'Restaurant, order-management SaaS' },
  },
];

const SVC_NAMES: Localized[] = [
  { es: 'AfterPanch', en: 'AfterPanch' },
  { es: 'Tienda de Perfumes', en: 'Perfume Store' },
  { es: 'Stickeando', en: 'Stickeando' },
  { es: 'Turnero para Farmacias', en: 'Pharmacy Queue System' },
];

// Fotos que aparecen al hacer hover sobre cada servicio (mismo orden que SVC_NAMES).
const SVC_IMAGES = [
  '/images/exp-afterpanch.jpg',
  '/images/exp-perfumes.jpg',
  '/images/exp-stickeando.jpg',
  '/images/exp-turnero.jpg',
];

const STORY_MS = 7000;

const svcTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 'clamp(58px, 7.4vw, 132px)',
  lineHeight: 0.98,
  letterSpacing: '-0.035em',
  color: '#4a4a48',
  transition: 'color 0.4s ease',
  cursor: 'none',
};

/**
 * stories-sec — port fiel del HTML. Testimonios (carrusel auto 7s + flechas),
 * lista de experiencia con imagen flotante que sigue el hover.
 * Carrusel e imagen flotante manejados de forma imperativa (como el original).
 */
export default function StoriesSection() {
  const { t, lang } = useLanguage();
  const lenis = useLenis();
  const goServices = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector('#services') as HTMLElement | null;
    if (!target) return;
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView({ behavior: 'smooth' });
  };
  const scopeRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const svcListRef = useRef<HTMLDivElement>(null);
  const svcImgRef = useRef<HTMLDivElement>(null);
  const svcPhotoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const svcTitleRefs = useRef<(HTMLElement | null)[]>([]);

  useRevealOnScroll(scopeRef);

  // --- carrusel de testimonios ---
  useGSAP(
    () => {
      let sIdx = 0;
      let sT0 = performance.now();
      let animating = false;

      // Parte la cita en líneas visuales; cada línea vive en su propia máscara
      // overflow:hidden para poder subirla/bajarla de forma independiente.
      const setQuoteLines = (text: string): HTMLElement[] => {
        const q = quoteRef.current;
        if (!q) return [];
        q.innerHTML = '';
        text.split(' ').forEach((w) => {
          const s = document.createElement('span');
          s.textContent = `${w} `;
          s.style.display = 'inline-block';
          s.style.whiteSpace = 'pre';
          q.appendChild(s);
        });
        const spans = Array.from(q.children) as HTMLElement[];
        const lines: string[] = [];
        let curTop: number | null = null;
        let cur: string[] = [];
        spans.forEach((s) => {
          if (s.offsetTop !== curTop) {
            if (cur.length) lines.push(cur.join(''));
            cur = [];
            curTop = s.offsetTop;
          }
          cur.push(s.textContent ?? '');
        });
        if (cur.length) lines.push(cur.join(''));
        q.innerHTML = '';
        lines.forEach((l) => {
          const mask = document.createElement('div');
          mask.style.overflow = 'hidden';
          const inner = document.createElement('div');
          inner.className = 'q-line';
          inner.style.willChange = 'transform';
          inner.textContent = l;
          mask.appendChild(inner);
          q.appendChild(mask);
        });
        return Array.from(q.querySelectorAll<HTMLElement>('.q-line'));
      };

      const qLines = () =>
        quoteRef.current ? Array.from(quoteRef.current.querySelectorAll<HTMLElement>('.q-line')) : [];

      const paint = () => {
        setQuoteLines(t(STORIES[sIdx].q));
        if (roleRef.current) roleRef.current.textContent = t(STORIES[sIdx].r);
        if (countRef.current) countRef.current.textContent = `0${sIdx + 1}/0${STORIES.length}`;
      };
      paint();

      const go = (dir: number) => {
        if (animating) return;
        animating = true;
        sT0 = performance.now();
        const outTargets = [...qLines(), roleRef.current].filter(Boolean) as HTMLElement[];
        if (!outTargets.length) {
          animating = false;
          return;
        }
        // cada línea sube y sale por su máscara, escalonada
        gsap.to(outTargets, {
          yPercent: -105,
          duration: 0.5,
          ease: 'power3.in',
          stagger: 0.055,
          onComplete: () => {
            sIdx = (sIdx + dir + STORIES.length) % STORIES.length;
            paint();
            // las líneas nuevas entran desde abajo, también escalonadas
            const inTargets = [...qLines(), roleRef.current].filter(Boolean) as HTMLElement[];
            gsap.fromTo(
              inTargets,
              { yPercent: 105 },
              { yPercent: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, onComplete: () => { animating = false; } },
            );
          },
        });
      };

      const onClick = (e: MouseEvent) => {
        const t = e.target as HTMLElement;
        if (t.closest('#story-next')) go(1);
        else if (t.closest('#story-prev')) go(-1);
      };
      document.addEventListener('click', onClick);

      const tick = () => {
        const sec = scopeRef.current;
        if (!sec) return;
        const r = sec.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) {
          sT0 = performance.now();
          return;
        }
        const el = (performance.now() - sT0) / STORY_MS;
        if (el >= 1) {
          go(1);
          return;
        }
        if (progRef.current) progRef.current.style.width = `${el * 100}%`;
      };
      gsap.ticker.add(tick);

      return () => {
        document.removeEventListener('click', onClick);
        gsap.ticker.remove(tick);
      };
    },
    { scope: scopeRef, dependencies: [lang] },
  );

  // --- lista de servicios: imagen flotante que sigue el hover ---
  const onSvcEnter = (idx: number) => {
    svcTitleRefs.current.forEach((t, i) => {
      if (t) t.style.color = i === idx ? '#f4f3f1' : '#4a4a48';
    });
    svcPhotoRefs.current.forEach((ph, i) => {
      if (ph) ph.style.opacity = i === idx ? '1' : '0';
    });
    const img = svcImgRef.current;
    const item = svcTitleRefs.current[idx];
    if (img && idx >= SVC_NAMES.length) {
      gsap.to(img, { opacity: 0, duration: 0.3, ease: 'power2.out' });
      return;
    }
    if (img && item && img.parentElement) {
      const listRect = img.parentElement.getBoundingClientRect();
      const itRect = item.getBoundingClientRect();
      const y = itRect.top - listRect.top + itRect.height / 2 - img.offsetHeight / 2;
      gsap.to(img, { y, opacity: 1, duration: 0.7, ease: 'power3.out' });
    }
  };
  const onSvcLeave = () => {
    svcTitleRefs.current.forEach((t) => {
      if (t) t.style.color = '#4a4a48';
    });
    if (svcImgRef.current) gsap.to(svcImgRef.current, { opacity: 0, duration: 0.4, ease: 'power2.out' });
  };

  return (
    <section
      id="stories-sec"
      ref={scopeRef}
      style={{
        position: 'relative',
        zIndex: 5,
        minHeight: '115vh',
        background: '#090906',
        color: '#f4f3f1',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'var(--font-main)',
      }}
    >
      {/* título */}
      <div style={{ padding: 'clamp(100px, 15vh, 200px) clamp(28px, 4vw, 72px) 0' }}>
      </div>

      <div className="st-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 0.85fr) 2.3fr', gap: 'clamp(32px, 4vw, 70px)', padding: 'clamp(48px, 7vh, 90px) clamp(28px, 4vw, 72px) clamp(80px, 12vh, 140px)' }}>
        {/* LEFT: testimonios */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#333330', position: 'relative' }}>
              <div ref={progRef} style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '0%', background: '#f4f3f1' }} />
            </div>
            <span ref={countRef} style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: '#8a8a8a' }}>
              01/05
            </span>
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
            <span id="story-prev" style={{ fontSize: 20, userSelect: 'none', cursor: 'none' }}>
              ←
            </span>
            <span id="story-next" style={{ fontSize: 20, userSelect: 'none', cursor: 'none' }}>
              →
            </span>
          </div>

          <div style={{ marginTop: 42, fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', color: '#8a8a8a' }}>
            {t({ es: '(HISTORIAS REALES)', en: '(REAL STORIES)' })}
          </div>

          <div style={{ marginTop: 28, overflow: 'hidden' }}>
            <p ref={quoteRef} style={{ margin: 0, fontWeight: 700, fontSize: 'clamp(19px, 1.6vw, 24px)', lineHeight: 1.2, letterSpacing: '-0.01em', maxWidth: 420 }} />
            <div style={{ overflow: 'hidden', marginTop: 22 }}>
              <div ref={roleRef} style={{ fontWeight: 500, fontSize: 13, color: '#8a8a8a' }} />
            </div>
          </div>
        </div>

        {/* RIGHT: lista de servicios + imagen flotante */}
        <div style={{ position: 'relative' }} onMouseLeave={onSvcLeave}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 'clamp(18px, 1.6vw, 24px)', fontWeight: 700, color: '#8a8a8a' }}>
            <span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: '50%', background: '#f4f3f1' }} />
            {t({ es: 'Experiencia', en: 'Experience' })}
          </div>

          <div ref={svcListRef} style={{ marginTop: 'clamp(24px, 4vh, 44px)', display: 'flex', flexDirection: 'column' }}>
            {SVC_NAMES.map((name, i) => (
              <div
                key={name.en}
                ref={(el) => {
                  svcTitleRefs.current[i] = el;
                }}
                onMouseEnter={() => onSvcEnter(i)}
                className="svc-name"
                style={svcTitle}
              >
                {t(name)}
              </div>
            ))}
            <a
              href="#services"
              ref={(el) => {
                svcTitleRefs.current[SVC_NAMES.length] = el;
              }}
              onClick={goServices}
              onMouseEnter={(e) => {
                onSvcEnter(SVC_NAMES.length);
                gsap.to(e.currentTarget, { x: 14, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
              }}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })}
              className="svc-name"
              style={{ ...svcTitle, textDecoration: 'none' }}
            >
              {t({ es: 'Ver más', en: 'See more' })}
            </a>
          </div>

          {/* imagen flotante */}
          <div
            ref={svcImgRef}
            style={{ position: 'absolute', right: '-3vw', top: 0, width: 'clamp(190px, 17.5vw, 305px)', aspectRatio: '3 / 4', overflow: 'hidden', opacity: 0, pointerEvents: 'none', zIndex: 2, willChange: 'transform, opacity' }}
          >
            {SVC_NAMES.map((name, i) => (
              <div
                key={name.en}
                ref={(el) => {
                  svcPhotoRefs.current[i] = el;
                }}
                style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.35s ease' }}
              >
                <Photo src={SVC_IMAGES[i]} alt={t(name)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
