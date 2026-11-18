'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useLanguage, type Localized } from '@/lib/language';

const animo = "var(--font-animo600), 'Helvetica Neue', Helvetica, sans-serif";
const mont = "var(--font-montserrat), 'Helvetica Neue', Helvetica, Arial, sans-serif";
const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-instrument), Georgia, serif',
  fontStyle: 'italic',
  textTransform: 'none',
  letterSpacing: '-.02em',
  fontSize: '1.12em',
};
const lineWrap: React.CSSProperties = {
  display: 'block',
  overflow: 'hidden',
  padding: '0 .15em .08em',
  margin: '0 -.15em -.08em',
};

const Serif = ({ children }: { children: React.ReactNode }) => <span style={serifStyle}>{children}</span>;

const PARAGRAPH: Localized = {
  es: 'Tres años en el IES Santa Fe — Tecnicatura en Desarrollo de Software. De los diagramas UML y el modelado de datos a metodologías ágiles con Scrum: sprints, dailies y entregas reales trabajando en equipo.',
  en: 'Three years at IES Santa Fe — Software Development degree. From UML diagrams and data modeling to agile methodologies with Scrum: sprints, dailies and real deliveries working as a team.',
};

const PROJECTS: { n: string; a: Localized; b: Localized; stack: string }[] = [
  { n: '( 01 )', a: { es: 'Plataforma de', en: 'Streaming' }, b: { es: 'Streaming', en: 'Platform' }, stack: 'Symfony · PHP · MySQL · Twig' },
  { n: '( 02 )', a: { es: 'Guardería', en: 'Boat Storage' }, b: { es: 'Náutica', en: 'Marina' }, stack: 'React · Spring Boot · PostgreSQL' },
];

/**
 * Educación (v10) — "©IES Santa Fe Tecnicatura. Mi recorrido de tres años en Software".
 * Titular por líneas con máscara, párrafo que se enciende palabra a palabra, panel
 * "2 Proyectos finales" al hover y card de foto que sigue al cursor sobre ©IES Santa Fe.
 * Va con key={lang} desde page.tsx, así las animaciones se re-inicializan al cambiar idioma.
 */
export default function EducacionSection() {
  const { t, lang } = useLanguage();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
      const qa = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(s));
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const edu = q('[data-edu]');
      const dot = q('[data-dot]');
      const meta = q('[data-meta]');
      const par = q('[data-par]');
      const state = q('[data-state]');
      const lnEls = qa('[data-ln]');
      const lines = lnEls.map((l) => l.parentElement as HTMLElement);

      if (!reduced) {
        gsap
          .timeline({ scrollTrigger: { trigger: edu, start: 'top 70%' }, defaults: { ease: 'expo.out' } })
          .from(lnEls, { yPercent: 110, duration: 1.3, stagger: 0.09 }, 0)
          .from(dot, { scale: 0, rotation: -90, duration: 1 }, 0.2)
          .from(Array.from(meta.children), { y: 14, opacity: 0, duration: 1, stagger: 0.08 }, 0.6)
          .from(par, { y: 16, opacity: 0, filter: 'blur(6px)', duration: 1.1, ease: 'power3.out' }, 0.75);

        // párrafo: las palabras se "encienden" al scrollear
        gsap.fromTo(
          qa('[data-w]'),
          { opacity: 0.12 },
          { opacity: 1, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: par, start: 'top 85%', end: 'bottom 50%', scrub: 1 } },
        );

        // meta: se abre desde el centro
        gsap.fromTo(
          Array.from(meta.children),
          { x: (i: number, _el: unknown, a: unknown[]) => (i - (a.length - 1) / 2) * -30, opacity: 0 },
          { x: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: meta, start: 'top 92%', end: 'top 70%', scrub: 1.2 } },
        );

        // titular: vaivén, escala, paralaje por línea, interletrado y salida
        gsap.fromTo(
          lines,
          { x: (i: number) => (i % 2 ? 1 : -1) * 18 },
          { x: 0, ease: 'none', stagger: 0.03, scrollTrigger: { trigger: state, start: 'top 95%', end: 'top 35%', scrub: 2 } },
        );
        gsap.fromTo(state, { scale: 0.985 }, { scale: 1.01, ease: 'none', scrollTrigger: { trigger: state, start: 'top bottom', end: 'bottom top', scrub: 2 } });
        gsap.to(dot, { y: 40, rotation: '+=90', ease: 'none', scrollTrigger: { trigger: edu, start: 'top bottom', end: 'bottom top', scrub: 2 } });
        lines.forEach((l, i) =>
          gsap.fromTo(l, { y: (i + 1) * 10 }, { y: -(i + 1) * 6, ease: 'none', scrollTrigger: { trigger: state, start: 'top bottom', end: 'bottom top', scrub: 1.6 } }),
        );
        gsap.fromTo(state, { letterSpacing: '-.02em' }, { letterSpacing: '-.06em', ease: 'none', scrollTrigger: { trigger: state, start: 'top 90%', end: 'bottom 30%', scrub: 1.6 } });
        gsap.to(lines, { opacity: 0.25, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: state, start: 'bottom 35%', end: 'bottom top', scrub: 1.4 } });
      }

      // 2 proyectos finales: hover despliega el panel
      const pfb = q('[data-pfbtn]');
      const pan = q('[data-pfpanel]');
      gsap.set(pan, { yPercent: -50, x: 16 });
      let hideT: ReturnType<typeof setTimeout> | undefined;
      const openP = () => {
        clearTimeout(hideT);
        gsap.to(pan, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
        pan.style.pointerEvents = 'auto';
        gsap.fromTo(qa('[data-pfi]'), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, delay: 0.08, ease: 'power3.out', overwrite: 'auto' });
      };
      const closeP = () => {
        hideT = setTimeout(() => {
          pan.style.pointerEvents = 'none';
          gsap.to(pan, { autoAlpha: 0, x: 16, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        }, 120);
      };
      [pfb, pan].forEach((el) => {
        el.addEventListener('pointerenter', openP);
        el.addEventListener('pointerleave', closeP);
      });
      pfb.addEventListener('focus', openP);
      pfb.addEventListener('blur', closeP);

      // hover en ©IES Santa Fe: desplazamiento + card de foto que sigue al cursor
      const ies = q('[data-pbtn]');
      const prev = q('[data-prev]');
      const noHover = window.matchMedia('(hover: none)').matches;
      if (!reduced) {
        ies.addEventListener('pointerenter', () => gsap.to(ies, { x: 10, letterSpacing: '.01em', duration: 0.9, ease: 'expo.out', overwrite: 'auto' }));
        ies.addEventListener('pointerleave', () => gsap.to(ies, { x: 0, letterSpacing: '0em', duration: 0.9, ease: 'expo.out', overwrite: 'auto' }));
      }
      gsap.set(prev, { xPercent: -50, yPercent: noHover ? -50 : -110, scale: 0.85 });
      const px = gsap.quickTo(prev, 'x', { duration: 0.7, ease: 'power3.out' });
      const py = gsap.quickTo(prev, 'y', { duration: 0.7, ease: 'power3.out' });
      const mv = (e: PointerEvent) => {
        px(e.clientX);
        py(e.clientY);
      };
      window.addEventListener('pointermove', mv, { passive: true });
      const show = (e?: PointerEvent) => {
        const r = ies.getBoundingClientRect();
        gsap.set(prev, { x: e ? e.clientX : r.left + r.width / 2, y: e ? e.clientY : r.top + r.height / 2 });
        gsap.to(prev, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
      };
      const hide = () => gsap.to(prev, { opacity: 0, scale: 0.85, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      ies.addEventListener('pointerenter', (e) => show(e as PointerEvent));
      ies.addEventListener('pointerleave', hide);
      ies.addEventListener('focus', () => show());
      ies.addEventListener('blur', hide);
      ies.addEventListener('click', () => {
        if (noHover) {
          if ((gsap.getProperty(prev, 'opacity') as number) > 0.5) hide();
          else show();
        }
      });

      return () => {
        clearTimeout(hideT);
        window.removeEventListener('pointermove', mv);
      };
    },
    { scope: rootRef, dependencies: [lang] },
  );

  const ariaTitle = t({
    es: '©IES Santa Fe Tecnicatura. Mi recorrido de tres años en Software. De los diagramas UML, al modelado de datos, a Scrum: sprints, dailies y entregas reales.',
    en: '©IES Santa Fe Degree. My three-year journey in Software. From UML diagrams to data modeling to Scrum: sprints, dailies and real deliveries.',
  });
  const paragraph = t(PARAGRAPH);

  return (
    <section
      id="procesos"
      ref={rootRef}
      style={{ position: 'relative', zIndex: 5, background: '#F4F3F1', color: '#111110', fontFamily: mont, WebkitFontSmoothing: 'antialiased', overflow: 'hidden' }}
    >
      {/* card de foto que sigue al cursor */}
      <div
        data-prev
        aria-hidden="true"
        style={{ position: 'fixed', left: 0, top: 0, zIndex: 30, width: 'clamp(240px,22vw,360px)', pointerEvents: 'none', opacity: 0 }}
      >
        <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: '#111110' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ies-santa-fe.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      <div
        data-edu
        style={{ position: 'relative', minHeight: '100svh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(70px,12vh,130px) clamp(16px,3vw,56px) clamp(40px,7vh,80px)' }}
      >
        <span
          data-dot
          className="edu-dot"
          aria-hidden="true"
          style={{ position: 'absolute', left: 'clamp(16px,6vw,140px)', top: '44%', display: 'block', width: 10, height: 10, background: '#111110', transform: 'rotate(45deg)' }}
        />

        <a
          data-pfbtn
          href="#proyectos-finales"
          style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 5, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, padding: '14px 8px', writingMode: 'vertical-rl', background: '#111110', color: '#F4F3F1', fontSize: 11, letterSpacing: '.06em', lineHeight: 1, textTransform: 'uppercase', textDecoration: 'none' }}
        >
          <span>{t({ es: '2 Proyectos finales', en: '2 Final projects' })}</span>
        </a>

        <div
          data-pfpanel
          style={{ position: 'absolute', right: 34, top: '50%', zIndex: 5, display: 'flex', flexDirection: 'column', gap: 22, width: 'clamp(240px,22vw,340px)', padding: 22, boxSizing: 'border-box', background: '#111110', color: '#F4F3F1', opacity: 0, visibility: 'hidden', pointerEvents: 'none' }}
        >
          {PROJECTS.map((p, i) => (
            <div key={p.n} style={{ display: 'contents' }}>
              {i > 0 && <span style={{ display: 'block', height: 1, background: '#2A2A27' }} />}
              <div data-pfi style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#9C9B96' }}>{p.n}</span>
                <span style={{ fontFamily: animo, fontSize: 'clamp(26px,2.2vw,38px)', lineHeight: 0.9, letterSpacing: '-.05em', textTransform: 'uppercase' }}>
                  {t(p.a)} <Serif>{t(p.b)}</Serif>
                </span>
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#B9B8B3' }}>{p.stack}</span>
              </div>
            </div>
          ))}
        </div>

        <h2
          data-state
          aria-label={ariaTitle}
          style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: animo, fontWeight: 400, fontSize: 'clamp(40px,min(7vw,12.5svh),140px)', lineHeight: 0.98, letterSpacing: '-.045em', textTransform: 'uppercase' }}
        >
          <span aria-hidden="true" style={lineWrap}>
            <span data-ln data-pbtn tabIndex={0} style={{ display: 'inline-block', cursor: 'default' }}>
              ©IES Santa Fe <Serif>{t({ es: 'Tecnicatura', en: 'Degree' })}</Serif>
            </span>
          </span>
          <span aria-hidden="true" style={lineWrap}>
            <span data-ln style={{ display: 'block' }}>{t({ es: 'Mi recorrido de tres', en: 'My three-year' })}</span>
          </span>
          <span aria-hidden="true" style={lineWrap}>
            <span data-ln style={{ display: 'block' }}>{t({ es: 'años en Software.', en: 'journey in Software.' })}</span>
          </span>
          <span aria-hidden="true" style={lineWrap}>
            <span data-ln style={{ display: 'block' }}>
              {t({ es: 'Diagramas', en: 'Diagrams' })} <Serif>UML</Serif>,
            </span>
          </span>
          <span aria-hidden="true" style={lineWrap}>
            <span data-ln style={{ display: 'block' }}>
              {t({ es: 'Modelado de', en: 'Data' })} <Serif>{t({ es: 'datos', en: 'modeling' })}</Serif>,
            </span>
          </span>
          <span aria-hidden="true" style={lineWrap}>
            <span data-ln style={{ display: 'block' }}>
              {t({ es: 'Metodologías', en: 'Agile' })} <Serif>{t({ es: 'ágiles', en: 'methods' })}</Serif>.
            </span>
          </span>
        </h2>

        <div
          data-meta
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px 18px', marginTop: 'clamp(28px,5vh,52px)', fontSize: 'clamp(13px,.95vw,16px)', textTransform: 'uppercase' }}
        >
          <span>IES Santa Fe — 2023 · 2025</span>
          <span style={{ padding: '.55em .8em', border: '1px solid #111110', fontSize: 11, letterSpacing: '.06em', lineHeight: 1 }}>
            {t({ es: 'AKA LA TECNICATURA', en: 'AKA THE DEGREE' })}
          </span>
        </div>

        <p
          data-par
          aria-label={paragraph}
          style={{ margin: 'clamp(22px,4vh,40px) auto 0', maxWidth: 820, textAlign: 'center', fontSize: 'clamp(17px,1.4vw,24px)', lineHeight: 1.45, textWrap: 'pretty' }}
        >
          {paragraph.split(/\s+/).map((w, i) => (
            <span key={i} data-w aria-hidden="true">
              {w}{' '}
            </span>
          ))}
        </p>
      </div>

      {/* ancla del botón "2 Proyectos finales" */}
      <div id="proyectos-finales" />
    </section>
  );
}
