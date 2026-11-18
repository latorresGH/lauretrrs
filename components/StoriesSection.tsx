'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useRevealOnScroll } from '@/lib/reveal';
import { useLanguage, type Localized } from '@/lib/language';
import { useLenis } from '@/lib/lenis';
import Photo from './Photo';

type LocalizedList = { es: string[]; en: string[] };

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

const SVC_ROWS: { n: string; h: Localized; p: Localized; tags: LocalizedList }[] = [
  {
    n: '01',
    h: { es: 'Diseño Web', en: 'Web Design' },
    p: {
      es: 'Sitios rápidos, claros y con estética editorial — pensados para que cada visita se convierta en cliente. Diseño completo en Figma antes de programar.',
      en: 'Fast, clear sites with an editorial aesthetic — built so every visit turns into a client. Fully designed in Figma before a line of code.',
    },
    tags: { es: ['Figma', 'Editorial', 'Responsive', 'GSAP'], en: ['Figma', 'Editorial', 'Responsive', 'GSAP'] },
  },
  {
    n: '02',
    h: { es: 'Sistemas a Medida', en: 'Custom Systems' },
    p: {
      es: 'Software hecho para tu negocio: gestión, paneles y automatizaciones que reemplazan las planillas y el papel. A medida, escalable y mantenible.',
      en: 'Software built for your business: management tools, dashboards and automations that replace spreadsheets and paperwork. Custom, scalable and maintainable.',
    },
    tags: { es: ['React', 'Spring Boot', 'PostgreSQL', 'Symfony'], en: ['React', 'Spring Boot', 'PostgreSQL', 'Symfony'] },
  },
  {
    n: '03',
    h: { es: 'UI / UX Design', en: 'UI / UX Design' },
    p: {
      es: 'Interfaces intuitivas y prototipos navegables — cada pantalla resuelve un objetivo concreto. Investigación, wireframes y testing antes del pixel final.',
      en: 'Intuitive interfaces and clickable prototypes — every screen solves a concrete goal. Research, wireframes and testing before the final pixel.',
    },
    tags: { es: ['Research', 'Wireframes', 'Prototipos', 'Testing'], en: ['Research', 'Wireframes', 'Prototypes', 'Testing'] },
  },
  {
    n: '04',
    h: { es: 'Optimización', en: 'Optimization' },
    p: {
      es: 'Performance, SEO técnico y métricas: menos tiempos de carga, más conversiones y todo medible. Auditorías y mejoras continuas sobre lo online.',
      en: "Performance, technical SEO and metrics: shorter load times, more conversions, and everything measurable. Ongoing audits and improvements for what's live.",
    },
    tags: { es: ['Core Web Vitals', 'SEO', 'Analytics'], en: ['Core Web Vitals', 'SEO', 'Analytics'] },
  },
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
 * lista de servicios con imagen flotante que sigue el hover, y "Mis Servicios"
 * (4 filas texto + video placeholder con parallax). Carrusel e imagen flotante
 * manejados de forma imperativa (como el original).
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

  // --- "Mis Servicios": filas interactivas — título partido en chars, relleno
  // al hover, flecha magnética, y body que se expande con tags escalonadas ---
  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return;
      const cleanup: Array<() => void> = [];
      const svcRows = Array.from(scope.querySelectorAll<HTMLElement>('[data-svcrow]'));

      // parte los títulos en caracteres (cada uno en su máscara para el roll)
      svcRows.forEach((row) => {
        const title = row.querySelector<HTMLElement>('.svc-title');
        if (!title || title.dataset.splitDone) return;
        title.dataset.splitDone = '1';
        const text = title.dataset.split || title.textContent || '';
        title.innerHTML = '';
        Array.from(text).forEach((ch) => {
          const mask = document.createElement('span');
          mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;';
          const inner = document.createElement('span');
          inner.className = 'svc-ch';
          inner.style.cssText = 'display:inline-block;will-change:transform;white-space:pre;';
          inner.textContent = ch;
          mask.appendChild(inner);
          title.appendChild(mask);
        });
      });

      // entrada: las filas entran escalonadas al asomar en el viewport
      const svcPendingRows = new Set(svcRows);
      const svcEnter = () => {
        if (!svcPendingRows.size) return;
        const vh = window.innerHeight;
        let d = 0;
        svcPendingRows.forEach((row) => {
          const r = row.getBoundingClientRect();
          if (r.top < vh * 0.92 && r.bottom > 0) {
            svcPendingRows.delete(row);
            gsap.to(row, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: d });
            const chars = row.querySelectorAll('.svc-ch');
            gsap.fromTo(chars, { y: '110%' }, { y: '0%', duration: 0.9, ease: 'power4.out', stagger: 0.022, delay: d + 0.1 });
            d += 0.1;
          }
        });
      };
      gsap.ticker.add(svcEnter);
      cleanup.push(() => gsap.ticker.remove(svcEnter));

      // hover: sube el relleno, invierte el texto, rueda los chars, flecha
      // magnética; click expande el body
      svcRows.forEach((row) => {
        const fill = row.querySelector<HTMLElement>('.svc-fill');
        const title = row.querySelector<HTMLElement>('.svc-title');
        const num = row.querySelector<HTMLElement>('.svc-num');
        const arrow = row.querySelector<HTMLElement>('.svc-arrow');
        const body = row.querySelector<HTMLElement>('.svc-body');
        const chars = row.querySelectorAll('.svc-ch');
        const ax = gsap.quickTo(arrow, 'x', { duration: 0.4, ease: 'power3.out' });
        const ay = gsap.quickTo(arrow, 'y', { duration: 0.4, ease: 'power3.out' });
        const setInk = (dark: boolean) => {
          const ink = dark ? '#101010' : '#f4f3f1';
          const sub = dark ? '#3a3a38' : '#8a8a8a';
          if (title) title.style.color = ink;
          if (num) num.style.color = sub;
          if (arrow) arrow.style.color = ink;
        };
        const onEnter = () => {
          gsap.to(fill, { scaleY: 1, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
          setInk(true);
          gsap.fromTo(chars, { y: '0%' }, { y: '-110%', duration: 0.3, ease: 'power2.in', stagger: 0.014, onComplete: () => {
            gsap.fromTo(chars, { y: '110%' }, { y: '0%', duration: 0.45, ease: 'power3.out', stagger: 0.014 });
          } });
          gsap.to(arrow, { rotate: -45, duration: 0.5, ease: 'power3.out' });
        };
        const onLeave = () => {
          if (row.dataset.open !== '1') {
            gsap.to(fill, { scaleY: 0, duration: 0.5, ease: 'power3.inOut', overwrite: 'auto' });
            setInk(false);
          }
          gsap.to(arrow, { rotate: 0, duration: 0.5, ease: 'power3.out' });
          ax(0); ay(0);
        };
        const onMove = (e: MouseEvent) => {
          if (!arrow) return;
          const r = arrow.getBoundingClientRect();
          ax((e.clientX - (r.left + r.width / 2)) * 0.25);
          ay((e.clientY - (r.top + r.height / 2)) * 0.25);
        };
        const onClick = () => {
          if (!body) return;
          const open = row.dataset.open === '1';
          if (!open) {
            row.dataset.open = '1';
            gsap.to(fill, { scaleY: 1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
            setInk(true);
            gsap.to(body, { height: body.scrollHeight, duration: 0.8, ease: 'power3.inOut', onComplete: () => { body.style.height = 'auto'; } });
            const tags = row.querySelectorAll('.svc-tags span');
            gsap.fromTo(tags, { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)', stagger: 0.06, delay: 0.25 });
            gsap.fromTo(body.querySelector('p'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.2 });
          } else {
            row.dataset.open = '';
            body.style.height = `${body.scrollHeight}px`;
            gsap.to(body, { height: 0, duration: 0.6, ease: 'power3.inOut' });
            gsap.to(fill, { scaleY: 0, duration: 0.5, ease: 'power3.inOut', delay: 0.15, overwrite: 'auto' });
            gsap.delayedCall(0.2, () => { if (row.dataset.open !== '1') setInk(false); });
          }
        };
        row.addEventListener('mouseenter', onEnter);
        row.addEventListener('mouseleave', onLeave);
        row.addEventListener('mousemove', onMove);
        row.addEventListener('click', onClick);
        cleanup.push(() => {
          row.removeEventListener('mouseenter', onEnter);
          row.removeEventListener('mouseleave', onLeave);
          row.removeEventListener('mousemove', onMove);
          row.removeEventListener('click', onClick);
        });
      });

      return () => cleanup.forEach((fn) => fn());
    },
    { scope: scopeRef, dependencies: [lang] },
  );

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

      {/* MIS SERVICIOS: título full-width + filas de servicio interactivas */}
      <div id="services" style={{ padding: 'clamp(80px, 12vh, 160px) 0 0' }}>
        <h2 data-letters className="svc-heading" style={{ margin: 0, padding: '0 0.5vw', fontFamily: 'var(--font-animo), var(--font-main)', fontWeight: 800, fontVariationSettings: '"wdth" 500', fontSize: 'clamp(40px, 12.8vw, 320px)', lineHeight: 0.92, letterSpacing: '-0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: 'center' }}>
          {t({ es: 'Mis Servicios', en: 'My Services' })}
        </h2>
      </div>

      <div style={{ marginTop: 'clamp(50px, 8vh, 110px)', paddingBottom: 'clamp(80px, 12vh, 160px)' }}>
        {SVC_ROWS.map((row, i) => (
          <div
            key={row.n}
            data-svcrow={i}
            style={{ position: 'relative', borderTop: '1px solid #222220', borderBottom: i === SVC_ROWS.length - 1 ? '1px solid #222220' : undefined, overflow: 'hidden', cursor: 'none', opacity: 0, transform: 'translateY(70px)' }}
          >
            <div className="svc-fill" style={{ position: 'absolute', inset: 0, background: '#f4f3f1', transform: 'scaleY(0)', transformOrigin: 'bottom', willChange: 'transform' }} />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '90px 1fr auto', alignItems: 'center', gap: 'clamp(20px, 3vw, 56px)', padding: 'clamp(26px, 4.5vh, 52px) clamp(28px, 4vw, 72px)' }}>
              <span className="svc-num" style={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.2em', color: '#8a8a8a', transition: 'color 0.3s ease' }}>({row.n})</span>
              <h3 className="svc-title" data-split={t(row.h)} style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(44px, 6.8vw, 128px)', lineHeight: 0.95, letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#f4f3f1', whiteSpace: 'nowrap', transition: 'color 0.3s ease' }}>
                {t(row.h)}
              </h3>
              <span className="svc-arrow" style={{ fontSize: 'clamp(26px, 3vw, 48px)', color: '#8a8a8a', willChange: 'transform', transition: 'color 0.3s ease' }}>→</span>
            </div>
            <div className="svc-body" style={{ position: 'relative', height: 0, overflow: 'hidden' }}>
              <div className="svc-body-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px, 4vw, 80px)', padding: '6px clamp(28px, 4vw, 72px) clamp(30px, 5vh, 56px) calc(90px + clamp(48px, 7vw, 128px))' }}>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(14px, 1.1vw, 17px)', lineHeight: 1.65, color: '#3a3a38' }}>{t(row.p)}</p>
                <div className="svc-tags" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignContent: 'start' }}>
                  {row.tags[lang].map((tag) => (
                    <span key={tag} style={{ padding: '8px 16px', border: '1px solid #1a1a1a', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a1a1a' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
