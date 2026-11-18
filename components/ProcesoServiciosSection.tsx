'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useLanguage, type Localized } from '@/lib/language';

const animo = "var(--font-animo600), 'Helvetica Neue', sans-serif";
const mont = "var(--font-montserrat), 'Helvetica Neue', Helvetica, Arial, sans-serif";
const mono = 'ui-monospace, Menlo, monospace';

const STEPS: { title: Localized; detail: Localized; img: string; alt: Localized }[] = [
  {
    title: { es: 'Estrategia y Auditoría', en: 'Strategy & Audit' },
    detail: {
      es: 'Entendemos el negocio, auditamos lo existente y definimos objetivos medibles. Research, benchmarking y un plan claro antes de diseñar nada.',
      en: 'We understand the business, audit what already exists, and define measurable goals. Research, benchmarking and a clear plan before designing anything.',
    },
    img: '/services/1.jpg',
    alt: { es: 'Planificación de estrategia', en: 'Strategy planning' },
  },
  {
    title: { es: 'Diseño e Identidad', en: 'Design & Identity' },
    detail: {
      es: 'Dirección visual, identidad y diseño de interfaz. Wireframes, prototipos y un sistema de diseño que define cómo se ve y se siente el producto.',
      en: 'Visual direction, identity and interface design. Wireframes, prototypes and a design system that defines how the product looks and feels.',
    },
    img: '/services/2.jpg',
    alt: { es: 'Diseño e identidad', en: 'Design and identity' },
  },
  {
    title: { es: 'Desarrollo', en: 'Development' },
    detail: {
      es: 'Desarrollo full-stack con Next.js, React, Node.js y PostgreSQL. Testeado, deployado y entregado listo para crecer.',
      en: 'Full-stack build with Next.js, React, Node.js and PostgreSQL. Tested, deployed and handed over ready to grow.',
    },
    img: '/services/3.jpg',
    alt: { es: 'Desarrollo', en: 'Development' },
  },
];

// Frase de servicios: cada token es una palabra; `n` marca el superíndice (01)…
type Token = { w: string; n?: string; small?: boolean };
const SENTENCE: { es: Token[]; en: Token[] } = {
  es: [
    { n: '(01)', w: 'Diseño' }, { w: 'Web,' },
    { n: '(02)', w: 'Sistemas' }, { w: 'a' }, { w: 'Medida,' },
    { n: '(03)', w: 'UI' }, { w: '/' }, { w: 'UX' }, { w: 'Design' }, { w: '&', small: true },
    { n: '(04)', w: 'Optimización.' },
  ],
  en: [
    { n: '(01)', w: 'Web' }, { w: 'Design,' },
    { n: '(02)', w: 'Custom' }, { w: 'Systems,' },
    { n: '(03)', w: 'UI' }, { w: '/' }, { w: 'UX' }, { w: 'Design' }, { w: '&', small: true },
    { n: '(04)', w: 'Optimization.' },
  ],
};

const supStyle: React.CSSProperties = {
  fontFamily: mont,
  fontSize: '.16em',
  letterSpacing: '.06em',
  verticalAlign: 'top',
  position: 'relative',
  top: '.5em',
  marginRight: '.35em',
};

/**
 * Proceso + Servicios (v6). "From idea to product" con letras que suben, 3 filas
 * (paso / texto / foto con parallax y clip) y "What I do" con la frase de servicios
 * que se enciende palabra a palabra. Va con key={lang} desde page.tsx.
 */
export default function ProcesoServiciosSection() {
  const { t, lang } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const big = t({ es: 'De la idea al producto', en: 'From idea to product' });

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
      const qa = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(s));
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // título gigante: letras que suben escalonadas y se comprimen al salir
      const bigEl = q('[data-big]');
      const ls = qa('[data-l]');
      gsap.from(ls, { yPercent: 110, duration: 1.3, stagger: { each: 0.035, from: 'center' }, ease: 'expo.out', scrollTrigger: { trigger: bigEl, start: 'top 85%' } });
      gsap.fromTo(
        ls,
        { y: 0 },
        { y: (i: number) => (i % 2 ? -0.14 : -0.05) * bigEl.offsetHeight, immediateRender: false, ease: 'none', scrollTrigger: { trigger: bigEl, start: 'top 40%', end: 'bottom top', scrub: 1.2 } },
      );

      // filas: la imagen se descubre y se desplaza en su marco; el texto acompaña
      qa('[data-row]').forEach((r) => {
        const m = r.querySelector<HTMLElement>('[data-media]')!;
        const inner = r.querySelector<HTMLElement>('[data-inner]')!;
        const tx = r.querySelector<HTMLElement>('[data-txt]')!;
        gsap.fromTo(m, { clipPath: 'inset(18% 0% 18% 30%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: r, start: 'top 90%', end: 'top 35%', scrub: 1.2 } });
        gsap.fromTo(inner, { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: r, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
        gsap.fromTo(Array.from(tx.children), { y: 70, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', stagger: 0.2, scrollTrigger: { trigger: r, start: 'top 85%', end: 'top 45%', scrub: 1 } });
      });

      // servicios
      const sv = q('[data-sv]');
      gsap.fromTo(q('[data-sh]'), { xPercent: 12 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: sv, start: 'top bottom', end: 'center top', scrub: 1 } });
      const sent = q('[data-sent]');
      gsap.fromTo(qa('[data-w]'), { color: '#26261F', y: 14 }, { color: '#F4F3F1', y: 0, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: sent, start: 'top 80%', end: 'bottom 50%', scrub: 1.2 } });
      gsap.fromTo(Array.from(sent.querySelectorAll('sup')), { color: '#26261F' }, { color: '#9C9B96', ease: 'none', stagger: 0.3, scrollTrigger: { trigger: sent, start: 'top 80%', end: 'bottom 50%', scrub: 1.2 } });
    },
    { scope: rootRef, dependencies: [lang] },
  );

  const sentenceLabel = SENTENCE[lang].map((k) => k.w).join(' ');

  return (
    <div ref={rootRef} style={{ position: 'relative', zIndex: 5, background: '#090906', color: '#F4F3F1', fontFamily: mont, WebkitFontSmoothing: 'antialiased', overflow: 'hidden' }}>
      {/* ===== PROCESO ===== */}
      <section id="process" data-proc style={{ position: 'relative', padding: 'clamp(60px,10vh,110px) clamp(16px,2vw,40px) 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, fontSize: 13, textTransform: 'uppercase', color: '#9C9B96' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#F4F3F1' }}>
            <span style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: '#F4F3F1' }} />
            {t({ es: 'Proceso', en: 'Process' })}
          </span>
          <span>{t({ es: 'Cómo trabajo', en: 'How I work' })}</span>
        </div>
        <h2
          data-big
          aria-label={big}
          style={{ margin: 'clamp(20px,4vh,40px) 0 clamp(50px,9vh,100px)', fontFamily: animo, fontWeight: 400, fontSize: lang === 'es' ? '7.9vw' : '9.4vw', lineHeight: 0.8, letterSpacing: '-.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: 'center', overflow: 'hidden', paddingBottom: '.04em' }}
        >
          {Array.from(big).map((ch, i) => (
            <span key={i} data-l aria-hidden="true" style={{ display: 'inline-block' }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </h2>

        <div>
          {STEPS.map((s, i) => (
            <div key={i} data-row className="ps-row" style={{ gap: 'clamp(16px,2vw,32px)', borderTop: '1px solid #1C1C19' }}>
              <span style={{ paddingTop: 'clamp(22px,3.4vh,36px)', fontFamily: mono, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: '#B9B8B3' }}>
                {t({ es: 'Paso', en: 'Step' })} • 0{i + 1}
              </span>
              <div data-txt style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,3vh,28px)', paddingTop: 'clamp(18px,3vh,30px)' }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 'clamp(32px,3.2vw,60px)', lineHeight: 0.95, letterSpacing: '-.035em', textWrap: 'balance' }}>
                  {t(s.title)}
                </h3>
                <p style={{ margin: 0, maxWidth: 360, fontSize: 'clamp(14px,1vw,17px)', lineHeight: 1.5, color: '#9C9B96', textWrap: 'pretty' }}>{t(s.detail)}</p>
              </div>
              <div data-media style={{ position: 'relative', height: 'clamp(380px,62svh,620px)', overflow: 'hidden', background: '#141411' }}>
                <div data-inner style={{ position: 'absolute', left: 0, right: 0, top: '-12%', height: '124%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={t(s.alt)} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'sepia(.35) saturate(.9) brightness(.92) contrast(1.03)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SERVICIOS ===== */}
      <section id="services" data-sv style={{ position: 'relative', padding: 'clamp(100px,16vh,180px) 0 clamp(80px,14vh,160px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, padding: '0 clamp(16px,3vw,56px)' }}>
          <h2 data-sh style={{ margin: 0, fontFamily: animo, fontWeight: 400, fontSize: 'clamp(56px,9vw,180px)', lineHeight: 0.82, letterSpacing: '-.06em', textTransform: 'uppercase' }}>
            {t({ es: 'Qué hago', en: 'What I do' })}
          </h2>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: '.6em', fontSize: 13, textTransform: 'uppercase' }}>
            <span style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: '#F4F3F1' }} />
            {t({ es: 'Servicios', en: 'Services' })}
          </span>
        </div>
        <p
          data-sent
          aria-label={sentenceLabel}
          style={{ margin: 'clamp(50px,9vh,100px) 0 0', padding: '0 clamp(16px,3vw,56px)', maxWidth: 1500, fontFamily: animo, fontWeight: 400, fontSize: 'clamp(40px,6.6vw,128px)', lineHeight: 0.98, letterSpacing: '-.05em', textTransform: 'uppercase', textWrap: 'balance' }}
        >
          <span aria-hidden="true">
            {SENTENCE[lang].map((k, i) => (
              <span key={i}>
                {k.n && <sup style={supStyle}>{k.n}</sup>}
                <span
                  data-w
                  style={{ display: 'inline-block', color: '#26261F', ...(k.small ? { fontFamily: mont, fontWeight: 400, fontSize: '.4em', letterSpacing: 0, verticalAlign: 'middle' } : null) }}
                >
                  {k.w}
                </span>{' '}
              </span>
            ))}
          </span>
        </p>
      </section>
    </div>
  );
}
