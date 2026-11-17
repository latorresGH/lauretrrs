'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, useGSAP } from '@/lib/gsap';
import { useLanguage } from '@/lib/language';
import { useLenis } from '@/lib/lenis';
import ContactButton from './ContactButton';

const PROJECTS = [
  { title: 'Náutica', src: '/images/nautica.webp' },
  { title: 'Streaming', src: '/images/streaming.jpg' },
  { title: 'Stickeando', src: '/images/exp-stickeando.jpg' },
  { title: 'Rush Fragances', src: '/images/exp-perfumes.jpg' },
  { title: 'Afterpanch', src: '/images/exp-afterpanch.jpg' },
];
const SETS = 3; // el set se repite para que la tira sea infinita

const labelFont = "var(--font-animo600), 'Helvetica Neue', sans-serif";
const mont = "var(--font-montserrat), 'Helvetica Neue', Helvetica, Arial, sans-serif";

/**
 * Hero (v59) — tira infinita de proyectos arriba, "LAURE" gigante + Acerca abajo.
 * Es sticky: al scrollear, la segunda sección (#procesos) sube y lo tapa, mientras
 * el contenido del hero baja con parallax. El Nav recién aparece en esa segunda sección.
 */
export default function HeroSection() {
  const { t, lang, toggle } = useLanguage();
  const lenis = useLenis();
  const heroRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const curRef = useRef<HTMLDivElement>(null);
  // tamaños aleatorios por proyecto (se generan en el cliente → sin mismatch de hidratación)
  const sizes = useRef<{ w: number; nw: number; r: number }[]>([]);

  const layout = () => {
    const hero = heroRef.current;
    if (!hero) return;
    const VW = hero.clientWidth || window.innerWidth;
    const VH = hero.clientHeight || window.innerHeight;
    const narrow = VW < 820;
    if (mainRef.current) mainRef.current.style.gridTemplateColumns = narrow ? 'minmax(0,1fr)' : 'minmax(0,1.7fr) minmax(0,1fr)';
    if (wordRef.current) wordRef.current.style.fontSize = narrow ? 'min(32vw,22svh)' : 'clamp(96px,min(22vw,36svh),460px)';
    const bottom = bottomRef.current;
    const avail = Math.max(150, VH - (bottom ? bottom.offsetHeight : 0) - 16);
    if (stripRef.current) stripRef.current.style.height = avail + 'px';
    const maxF = avail - 40;
    hero.querySelectorAll<HTMLElement>('[data-card]').forEach((c) => {
      const s = sizes.current[+(c.dataset.card as string)];
      if (!s) return;
      c.style.width = (narrow ? s.nw : s.w) + 'vw';
      (c.querySelector('[data-frame]') as HTMLElement).style.height = Math.round(Math.max(90, maxF * s.r)) + 'px';
    });
  };

  useEffect(() => {
    // valores repartidos en tramos y mezclados → se nota la diferencia entre cards
    const spread = (min: number, max: number) => {
      const n = PROJECTS.length;
      const vals = Array.from({ length: n }, (_, i) => min + ((i + Math.random()) / n) * (max - min));
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [vals[i], vals[j]] = [vals[j], vals[i]];
      }
      return vals;
    };
    const rs = spread(0.62, 1); // fracción del alto disponible (el ancho es igual para todas)
    sizes.current = PROJECTS.map((_, i) => ({ w: 28, nw: 64, r: rs[i] }));
    layout();
    const ro = new ResizeObserver(layout);
    if (heroRef.current) ro.observe(heroRef.current);
    window.addEventListener('resize', layout);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', layout);
    };
  }, []);

  useGSAP(
    () => {
      const hero = heroRef.current!;
      const track = trackRef.current!;
      const bottom = bottomRef.current!;
      const cur = curRef.current!;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const noHover = window.matchMedia('(hover: none)').matches;
      const q = <T extends Element>(s: string) => Array.from(hero.querySelectorAll<T>(s));
      const state = { pos: 0, boost: 0, autoSpeed: reduced ? 0 : 1 };

      // tira infinita: deriva sola y acelera con el scroll; el contenido baja con parallax
      let lastY = window.scrollY || 0;
      let hidden = false;
      const tick = () => {
        const dt = Math.min(0.05, gsap.ticker.deltaRatio(60) / 60);
        const y = window.scrollY || 0;
        const dy = y - lastY;
        lastY = y;
        const H = hero.offsetHeight || 1;
        // ya tapado por la 2ª sección: no gastar frames
        const covered = y > H * 1.05;
        if (covered !== hidden) {
          hidden = covered;
          hero.style.visibility = covered ? 'hidden' : 'visible';
        }
        if (covered) return;
        state.boost += (dy * 1.6 - state.boost) * (1 - Math.exp(-dt * 6));
        state.pos += 42 * dt * state.autoSpeed + (reduced ? 0 : state.boost);
        const setW = (track.firstElementChild as HTMLElement).offsetWidth || 1;
        gsap.set(track, { x: -(((state.pos % setW) + setW) % setW) });
        if (!reduced) {
          const p = Math.min(1, Math.max(0, y / H));
          gsap.set(bottom, { y: p * H * 0.12 });
        }
      };
      gsap.ticker.add(tick);

      if (!reduced) {
        state.autoSpeed = 0;
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from(q('[data-card]'), { yPercent: -110, duration: 1.6, stagger: 0.04 }, 0)
          .from(q('[data-cimg]'), { scale: 1.3, duration: 2.4, stagger: 0.04 }, 0.1)
          .from(q('[data-letter]'), { yPercent: 110, duration: 1.4, stagger: 0.045 }, 0.5)
          .from(q('[data-st]'), { y: 18, opacity: 0, filter: 'blur(6px)', duration: 1.1, stagger: 0.1, ease: 'power3.out' }, 0.9)
          .from(q('[data-foot]'), { opacity: 0, y: 10, duration: 1, ease: 'power3.out' }, 1.1)
          .to(state, { autoSpeed: 1, duration: 2.5, ease: 'sine.inOut' }, 1);
      }

      // cursor "View project" + títulos al hover
      gsap.set(cur, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
      const cx = gsap.quickTo(cur, 'x', { duration: 0.5, ease: 'power3.out' });
      const cy = gsap.quickTo(cur, 'y', { duration: 0.5, ease: 'power3.out' });
      if (noHover) gsap.set(q('[data-lab]'), { opacity: 1 });
      const cleanups: (() => void)[] = [];
      q<HTMLElement>('[data-card]').forEach((c) => {
        const im = c.querySelector('[data-cimg]');
        const lab = c.querySelector('[data-lab]');
        const enter = (e: PointerEvent) => {
          gsap.to(state, { autoSpeed: 0.1, duration: 0.8, ease: 'sine.out', overwrite: 'auto' });
          gsap.to(im, { scale: 1.06, duration: 1.2, ease: 'expo.out', overwrite: 'auto' });
          if (!noHover) gsap.fromTo(lab, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
          gsap.set(cur, { x: e.clientX, y: e.clientY });
          gsap.to(cur, { scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
        };
        const leave = () => {
          gsap.to(state, { autoSpeed: 1, duration: 1.2, ease: 'sine.inOut', overwrite: 'auto' });
          gsap.to(im, { scale: 1, duration: 1.2, ease: 'expo.out', overwrite: 'auto' });
          if (!noHover) gsap.to(lab, { opacity: 0, y: 6, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          gsap.to(cur, { scale: 0, opacity: 0, duration: 0.35, ease: 'power2.in', overwrite: 'auto' });
        };
        c.addEventListener('pointerenter', enter);
        c.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          c.removeEventListener('pointerenter', enter);
          c.removeEventListener('pointerleave', leave);
        });
      });
      const mv = (e: PointerEvent) => {
        cx(e.clientX);
        cy(e.clientY);
      };
      window.addEventListener('pointermove', mv, { passive: true });

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener('pointermove', mv);
        cleanups.forEach((f) => f());
      };
    },
    { scope: heroRef },
  );

  const goWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector('#procesos') as HTMLElement | null;
    if (!target) return;
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView({ behavior: 'smooth' });
  };

  const cardStyle: React.CSSProperties = { position: 'relative', flex: 'none', display: 'flex', flexDirection: 'column', gap: 12, width: '26vw' };

  return (
    <section
      id="me"
      ref={heroRef}
      data-screen-label="Hero"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 0,
        height: '100svh',
        minHeight: 560,
        overflow: 'hidden',
        background: '#E4E2DB',
        color: '#111110',
        fontFamily: mont,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* grano (solo del hero) */}
      <div aria-hidden className="hero-grain" style={{ position: 'absolute', inset: 0, zIndex: 40, pointerEvents: 'none', opacity: 0.08, mixBlendMode: 'multiply' }} />

      {/* cursor "View project" */}
      <div
        ref={curRef}
        aria-hidden
        style={{ position: 'fixed', left: 0, top: 0, zIndex: 50, pointerEvents: 'none', background: '#F1E7A6', color: '#111110', borderRadius: 3, padding: '4px 18px', fontWeight: 600, fontSize: 20, letterSpacing: '-.01em', whiteSpace: 'nowrap' }}
      >
        {t({ es: 'Ver proyecto', en: 'View project' })}
      </div>

      {/* tira de proyectos */}
      <div ref={stripRef} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '56svh', zIndex: 1, willChange: 'transform' }}>
        <div ref={trackRef} style={{ display: 'flex', alignItems: 'flex-start', width: 'max-content', willChange: 'transform' }}>
          {Array.from({ length: SETS }, (_, setIdx) => (
            <div key={setIdx} aria-hidden={setIdx > 0 || undefined} style={{ display: 'flex', alignItems: 'flex-start' }}>
              {PROJECTS.map((p, i) => (
                <a key={p.title} data-card={i} href="#procesos" onClick={goWorks} tabIndex={setIdx > 0 ? -1 : undefined} style={cardStyle}>
                  <span data-frame style={{ position: 'relative', display: 'block', height: '36svh', overflow: 'hidden', background: '#111110' }}>
                    <span data-cimg style={{ position: 'absolute', inset: 0, display: 'block' }}>
                      <Image src={p.src} alt={p.title} fill sizes="40vw" style={{ objectFit: 'cover' }} priority={setIdx === 0} />
                    </span>
                  </span>
                  <span
                    data-lab
                    style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '0 14px', opacity: 0, fontFamily: labelFont, fontSize: 'clamp(20px,1.7vw,30px)', lineHeight: 1, letterSpacing: '-.04em', textTransform: 'uppercase' }}
                  >
                    <span style={{ fontFamily: mont, fontWeight: 600, fontSize: 12, letterSpacing: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                    {p.title}
                  </span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* marca (arriba derecha) */}
      <a href="#me" aria-label="Inicio" style={{ position: 'absolute', top: 'clamp(14px,1.6vw,24px)', right: 'clamp(14px,1.6vw,24px)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, background: '#E4E2DB' }}>
        <span style={{ display: 'block', width: 16, height: 22, borderLeft: '4px solid #111110', borderBottom: '4px solid #111110' }} />
      </a>

      {/* abajo: palabra + acerca + footer */}
      <div ref={bottomRef} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 'clamp(14px,2.4svh,28px)', padding: '0 clamp(16px,2vw,40px) clamp(14px,2.4svh,26px)', willChange: 'transform' }}>
        <div ref={mainRef} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', alignItems: 'end', gap: 'clamp(20px,3vw,56px)' }}>
          <h1
            ref={wordRef}
            aria-label="Laure"
            style={{ margin: 0, overflow: 'hidden', padding: '.04em 0 .02em', whiteSpace: 'nowrap', fontFamily: labelFont, fontWeight: 400, fontSize: 'clamp(96px,min(22vw,36svh),460px)', lineHeight: 0.8, letterSpacing: '-.065em', textTransform: 'uppercase' }}
          >
            {Array.from('Laure').map((ch, i) => (
              <span key={i} data-letter aria-hidden style={{ display: 'inline-block', willChange: 'transform' }}>{ch}</span>
            ))}
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: '.6em', maxWidth: 400, justifySelf: 'end', marginRight: 'clamp(24px,4vw,80px)' }}>
            <span data-st style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'clamp(15px,1.1vw,19px)', letterSpacing: '-.01em', textTransform: 'uppercase' }}>
              <span style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: '#111110' }} />
              {t({ es: 'Acerca', en: 'About' })}
            </span>
            <p data-st style={{ margin: 0, fontSize: 'clamp(18px,1.4vw,26px)', lineHeight: 1.28, letterSpacing: '-.025em', textWrap: 'pretty' }}>
              {t({
                es: 'Soy Laureano — desarrollador y diseñador independiente que crea experiencias digitales donde la forma se encuentra con el movimiento.',
                en: "I'm Laureano — an independent developer and designer crafting digital experiences where form meets motion.",
              })}
            </p>
          </div>
        </div>

        <div data-foot style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px 24px', fontSize: 13, letterSpacing: '-.005em', textTransform: 'uppercase' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span>© 2026</span>
            <span style={{ color: '#9A9891' }}>|</span>
            <span>Santa Fe, Ar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button onClick={toggle} aria-label="Toggle language" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#111110', cursor: 'pointer' }}>
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <ContactButton />
          </div>
        </div>
      </div>
    </section>
  );
}
