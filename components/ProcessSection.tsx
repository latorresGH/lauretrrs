'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useRevealOnScroll } from '@/lib/reveal';
import { useLanguage, type Localized } from '@/lib/language';

const STEPS: { n: string; title: Localized; detail: Localized }[] = [
  {
    n: '01',
    title: { es: 'Estrategia y Auditoría', en: 'Strategy & Audit' },
    detail: {
      es: 'Entendemos el negocio, auditamos lo existente y definimos objetivos medibles. Research, benchmarking y un plan claro antes de diseñar nada.',
      en: 'We understand the business, audit what already exists, and define measurable goals. Research, benchmarking and a clear plan before designing anything.',
    },
  },
  {
    n: '02',
    title: { es: 'Diseño e Identidad', en: 'Design & Identity' },
    detail: {
      es: 'Sistema visual, tipografía e interfaz: prototipos navegables en Figma que definen cómo se ve y se siente cada pantalla.',
      en: 'Visual system, typography and interface: clickable Figma prototypes that define how every screen looks and feels.',
    },
  },
  {
    n: '03',
    title: { es: 'Desarrollo', en: 'Development' },
    detail: {
      es: 'Construcción, testing y deploy. Código limpio, performante y documentado — listo para crecer y fácil de mantener.',
      en: 'Build, test and deploy. Clean, performant and documented code — ready to grow and easy to maintain.',
    },
  },
];

/**
 * process-sec — port fiel del HTML. Pin de 320vh: el paso activo se calcula por
 * el progreso del scroll dentro del pin; se ilumina su título, se expande su
 * detalle (height: scrollHeight) y el número gigante de fondo transiciona.
 */
export default function ProcessSection() {
  const { t } = useLanguage();
  const scopeRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const bignumRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const detailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useRevealOnScroll(scopeRef);

  useGSAP(
    () => {
      const pin = pinRef.current;
      if (!pin) return;
      let cur = -1;

      const setProc = (n: number) => {
        if (n === cur) return;
        cur = n;
        STEPS.forEach((_, k) => {
          const title = titleRefs.current[k];
          const detail = detailRefs.current[k];
          const active = k === n;
          if (title) title.style.color = active ? '#f4f3f1' : '#4a4a48';
          if (detail) {
            if (active) {
              gsap.to(detail, { height: detail.scrollHeight, duration: 0.7, ease: 'power3.inOut' });
              if (detail.firstElementChild) {
                gsap.fromTo(detail.firstElementChild, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.15 });
              }
            } else {
              gsap.to(detail, { height: 0, duration: 0.5, ease: 'power3.inOut' });
            }
          }
        });
        const bignum = bignumRef.current;
        if (bignum) {
          bignum.textContent = String(n + 1);
          gsap.fromTo(bignum, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
        }
      };

      const tick = () => {
        const r = pin.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const total = Math.max(pin.offsetHeight - window.innerHeight, 1);
        const p = Math.min(Math.max(-r.top / total, 0), 1);
        setProc(Math.min(Math.floor(p * STEPS.length), STEPS.length - 1));
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: scopeRef },
  );

  return (
    <section
      id="process-sec"
      ref={scopeRef}
      style={{ position: 'relative', zIndex: 5, background: '#090906', color: '#f4f3f1', boxSizing: 'border-box', fontFamily: 'var(--font-main)' }}
    >
      <div style={{ padding: 'clamp(90px, 14vh, 200px) clamp(28px, 4vw, 72px) 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, fontWeight: 800, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#8a8a8a' }}>
          <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: '#8a8a8a' }} />
          {t({ es: 'Cómo trabajo', en: 'How I work' })}
        </div>
        <h2 data-letters style={{ margin: 'clamp(20px, 3vh, 40px) 0 0', fontFamily: 'var(--font-animo), var(--font-serif)', fontWeight: 700, fontVariationSettings: '"wdth" 500', fontSize: 'clamp(64px, 10vw, 200px)', lineHeight: 0.9, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
          {t({ es: 'El Proceso', en: 'The Process' })}
        </h2>
      </div>

      <div ref={pinRef} style={{ position: 'relative', height: '320vh' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(28px, 4vw, 72px)', boxSizing: 'border-box' }}>
          <div
            ref={bignumRef}
            style={{ position: 'absolute', right: 'clamp(20px, 4vw, 90px)', top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', var(--font-display)", fontWeight: 400, fontSize: 'clamp(280px, 42vw, 680px)', lineHeight: 0.7, color: '#171715', pointerEvents: 'none', userSelect: 'none' }}
          >
            1
          </div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.4vh, 18px)' }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ borderTop: '1px solid #2a2a28', borderBottom: i === STEPS.length - 1 ? '1px solid #2a2a28' : undefined, padding: 'clamp(14px, 2.4vh, 30px) 0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(20px, 3vw, 60px)' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.14em', color: '#8a8a8a' }}>{step.n}</span>
                  <span
                    ref={(el) => {
                      titleRefs.current[i] = el;
                    }}
                    style={{ fontWeight: 800, fontSize: 'clamp(38px, 6.4vw, 120px)', lineHeight: 0.98, letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#4a4a48', transition: 'color 0.5s ease' }}
                  >
                    {t(step.title)}
                  </span>
                </div>
                <div
                  ref={(el) => {
                    detailRefs.current[i] = el;
                  }}
                  style={{ overflow: 'hidden', height: 0 }}
                >
                  <p style={{ margin: '16px 0 0 clamp(48px, 6vw, 118px)', maxWidth: 520, fontWeight: 500, fontSize: 'clamp(14px, 1.1vw, 17px)', lineHeight: 1.6, color: '#a8a8a4' }}>
                    {t(step.detail)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
