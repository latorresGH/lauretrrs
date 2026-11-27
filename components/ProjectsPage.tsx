'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { useLanguage, type Localized } from '@/lib/language';
import ContactButton from './ContactButton';

type Project = { num: string; name: string; type: Localized; img: string };

// Mismos proyectos e imágenes que la tira del hero.
const PROJECTS: Project[] = [
  {
    num: '01',
    name: 'AfterPanch',
    type: {
      es: 'Plataforma de menú interactivo con carrito y pedidos en tiempo real.',
      en: 'Interactive menu platform with cart and real-time ordering.',
    },
    img: '/images/exp-afterpanch.jpg',
  },
  {
    num: '02',
    name: 'Stickeando',
    type: { es: 'Proyecto web.', en: 'Web project.' },
    img: '/images/exp-stickeando.jpg',
  },
  {
    num: '03',
    name: 'Náutica',
    type: {
      es: 'Sistema de gestión para guardería náutica: turnos, usuarios y reportes.',
      en: 'Management system for a boat storage facility: bookings, users and reports.',
    },
    img: '/images/nautica.webp',
  },
  {
    num: '04',
    name: 'Rush Fragances',
    type: { es: 'Proyecto web.', en: 'Web project.' },
    img: '/images/exp-perfumes.jpg',
  },
  {
    num: '05',
    name: 'Streaming',
    type: {
      es: 'Catálogo de películas full-stack con ranking y panel de administración.',
      en: 'Full-stack movie catalog with rankings and an admin panel.',
    },
    img: '/images/streaming.jpg',
  },
];

const ANIMO = "var(--font-animo600), 'Helvetica Neue', sans-serif";
const MONT = "var(--font-montserrat), 'Helvetica Neue', Helvetica, Arial, sans-serif";
const pad2 = (n: number) => String(n).padStart(2, '0');

/** Remonta la vista al cambiar el idioma (el título se parte en letras de forma imperativa). */
export default function ProjectsPage() {
  const { lang } = useLanguage();
  return <ProjectsView key={lang} />;
}

/**
 * Proyectos (mockup v5) — dos vistas:
 *  - Carrousel: pila 3D de tarjetas en bucle infinito (wheel / swipe / flechas / auto 4.2s).
 *  - Lista: filas con imagen flotante que sigue al cursor (en mobile se despliega inline).
 * Toda la animación es imperativa (rAF + GSAP), como el mockup.
 */
function ProjectsView() {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector<T>(s)!;
    const qa = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));
    const cleanups: (() => void)[] = [];
    const on = (el: EventTarget, ev: string, fn: EventListener, o?: AddEventListenerOptions) => {
      el.addEventListener(ev, fn, o);
      cleanups.push(() => el.removeEventListener(ev, fn, o));
    };

    let mode: 'cine' | 'list' = 'cine';
    let busy = false;
    let mx = 0, my = 0, mxS = 0, myS = 0;
    let cx: number | null = null, cy: number | null = null;
    let active = 0;
    let intro = 0;
    let isM = false;
    let target = 0, pos = 0, acc = 0;
    let lastStep = performance.now(), lastInput = 0, lastMove = 0;
    let raf = 0;
    let titleTl: gsap.core.Timeline | null = null;

    // --- grano ---
    {
      const c = document.createElement('canvas');
      c.width = c.height = 180;
      const x = c.getContext('2d');
      if (x) {
        const im = x.createImageData(180, 180);
        for (let i = 0; i < im.data.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
          im.data[i + 3] = 255;
        }
        x.putImageData(im, 0, 0);
        q('[data-grain]').style.backgroundImage = `url(${c.toDataURL()})`;
      }
    }

    // Parte un texto en letras, cada una con su máscara para animarla.
    const split = (el: HTMLElement, text: string) => {
      el.textContent = '';
      el.setAttribute('aria-label', text);
      const out: HTMLElement[] = [];
      text.split(' ').forEach((w, wi, arr) => {
        const word = document.createElement('span');
        word.setAttribute('aria-hidden', 'true');
        word.style.cssText = 'display:inline-block; white-space:nowrap;';
        Array.from(w).forEach((ch) => {
          const o = document.createElement('span');
          o.style.cssText = 'display:inline-block; overflow:hidden; vertical-align:top; padding-top:.06em;';
          const i = document.createElement('span');
          i.style.cssText = 'display:inline-block; will-change:transform;';
          i.textContent = ch;
          o.appendChild(i);
          word.appendChild(o);
          out.push(i);
        });
        el.appendChild(word);
        if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
      });
      return out;
    };

    const cards = qa('[data-c]');
    const rows = qa('[data-row]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const set = (el: HTMLElement | null, o: Partial<CSSStyleDeclaration>) => {
      if (el) Object.assign(el.style, o);
    };
    const applyLayout = () => {
      const m = (isM = window.innerWidth < 760);
      set(q('[data-views]'), m
        ? { top: '72px', left: '20px', right: 'auto', transform: 'none', flexDirection: 'row', gap: '22px' }
        : { top: '50%', left: 'auto', right: 'clamp(16px,2vw,40px)', transform: 'translateY(-50%)', flexDirection: 'column', gap: '6px' });
      set(q('[data-info]'), m
        ? { top: 'auto', bottom: '32px', left: '20px', right: '20px', transform: 'none', width: 'auto', gap: '12px' }
        : { top: '50%', bottom: 'auto', left: 'clamp(16px,3vw,56px)', right: 'auto', transform: 'translateY(-50%)', width: 'min(30vw,520px)', gap: 'clamp(16px,2.4vh,28px)' });
      set(q('[data-title]'), { fontSize: m ? 'clamp(40px,12vw,56px)' : 'clamp(40px,5.6vw,112px)' });
      set(q('[data-type]'), { fontSize: m ? '13px' : 'clamp(13px,1vw,15px)', maxWidth: m ? '30ch' : '34ch' });
      set(q('[data-stack]'), { top: m ? '41%' : '50%' });
      cards.forEach((c) => set(c, { width: m ? '58vw' : 'clamp(220px,23vw,400px)' }));
      set(q('[data-counter]'), m ? { display: 'none' } : { display: 'flex', bottom: 'clamp(24px,5vh,48px)', right: 'clamp(16px,3vw,56px)' });
      set(q('[data-hint]'), { display: m ? 'none' : 'block' });
      set(q('[data-list]'), {
        paddingTop: m ? '128px' : 'clamp(120px,18vh,180px)',
        paddingLeft: m ? '20px' : 'clamp(16px,3vw,56px)',
        paddingRight: m ? '20px' : 'clamp(130px,12vw,200px)',
      });
      rows.forEach((o) => set(o, {
        gridTemplateColumns: m ? '26px minmax(0,1fr)' : 'clamp(40px,5vw,80px) minmax(0,1fr) auto',
        gap: m ? '6px 12px' : '20px',
        padding: m ? '18px 0' : 'clamp(10px,1.6vh,18px) 0',
        borderTop: m ? '1px solid #1A1A17' : '0',
        alignItems: m ? 'baseline' : 'center',
      }));
      qa('[data-rname]').forEach((o) => set(o, { fontSize: m ? 'clamp(30px,9vw,40px)' : 'clamp(28px,3.8vw,68px)' }));
      qa('[data-rtype]').forEach((o) => set(o, {
        gridColumn: m ? '2' : 'auto',
        textAlign: m ? 'left' : 'right',
        maxWidth: m ? 'none' : '28ch',
        fontSize: m ? '13px' : 'clamp(12px,1vw,14px)',
      }));
      qa('[data-rimg]').forEach((o) => set(o, { display: m ? 'block' : 'none' }));
    };
    applyLayout();
    on(window, 'resize', applyLayout);

    // --- hover de las opciones de vista ---
    qa<HTMLButtonElement>('[data-mode]').forEach((b) => {
      const rl = b.querySelectorAll('[data-roll]');
      on(b, 'pointerenter', () => {
        gsap.to(rl, { yPercent: -100, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
        if (b.dataset.mode !== mode) b.style.color = '#B9B8B3';
      });
      on(b, 'pointerleave', () => {
        gsap.to(rl, { yPercent: 0, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
        if (b.dataset.mode !== mode) b.style.color = '#5A5955';
      });
      on(b, 'click', () => setMode(b.dataset.mode as 'cine' | 'list'));
    });

    on(window, 'pointermove', ((e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      cx = e.clientX;
      cy = e.clientY;
    }) as EventListener, { passive: true });

    // --- cursor "Ver proyecto" ---
    const cur = q('[data-cursor]');
    const curX = gsap.quickTo(cur, 'x', { duration: 0.6, ease: 'power3.out' });
    const curY = gsap.quickTo(cur, 'y', { duration: 0.6, ease: 'power3.out' });
    const showCur = (v: boolean) =>
      gsap.to(cur, { scale: v ? 1 : 0, duration: v ? 0.6 : 0.4, ease: v ? 'expo.out' : 'power2.out', overwrite: 'auto' });
    cards.forEach((c) => {
      on(c, 'pointerenter', ((e: PointerEvent) => { if (e.pointerType === 'mouse') showCur(true); }) as EventListener);
      on(c, 'pointerleave', () => showCur(false));
    });

    // --- lista: imagen que se abre desde el centro y sigue al cursor ---
    const fl = q('[data-float]'), fimgs = qa('[data-fimg]');
    const flX = gsap.quickTo(fl, 'x', { duration: 0.9, ease: 'power3.out' });
    const flY = gsap.quickTo(fl, 'y', { duration: 0.9, ease: 'power3.out' });
    gsap.set(fl, { xPercent: -50, yPercent: -50 });
    const resetRows = () => {
      rows.forEach((o) => {
        (o.querySelector('[data-rname]') as HTMLElement).style.color = '#F4F3F1';
        (o.querySelector('[data-rname]') as HTMLElement).style.transform = 'translateX(0)';
        (o.querySelector('[data-rtype]') as HTMLElement).style.color = '#9C9B96';
      });
    };
    rows.forEach((r) => {
      const i = Number(r.dataset.i);
      on(r, 'pointerenter', ((e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        showCur(true);
        gsap.to(fl, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out' });
        fimgs.forEach((im, k) =>
          gsap.to(im, { opacity: k === i ? 1 : 0, scale: k === i ? 1 : 1.15, duration: k === i ? 0.9 : 0.6, ease: 'power3.out' }),
        );
        rows.forEach((o, k) => {
          const n = o.querySelector('[data-rname]') as HTMLElement;
          n.style.color = k === i ? '#F4F3F1' : '#2E2E29';
          n.style.transform = k === i ? 'translateX(24px)' : 'translateX(0)';
          (o.querySelector('[data-rtype]') as HTMLElement).style.color = k === i ? '#F4F3F1' : '#3A3A34';
        });
      }) as EventListener);
      on(r, 'pointerleave', ((e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        window.setTimeout(() => {
          if (r.matches(':hover') || root.querySelector('[data-row]:hover')) return;
          showCur(false);
          gsap.to(fl, { clipPath: 'inset(50% 50% 50% 50%)', duration: 0.6, ease: 'power2.inOut' });
          resetRows();
        }, 20);
      }) as EventListener);
    });

    // mobile: tocar una fila despliega su imagen
    const closeImg = (o: HTMLElement) => {
      o.dataset.open = '0';
      gsap.to(o.querySelector('[data-rimg]'), { height: 0, marginTop: 0, duration: 0.7, ease: 'expo.inOut' });
    };
    rows.forEach((o) =>
      on(o, 'click', () => {
        if (!isM) return;
        const wasOpen = o.dataset.open === '1';
        rows.forEach((x) => { if (x !== o && x.dataset.open === '1') closeImg(x); });
        if (wasOpen) { closeImg(o); return; }
        o.dataset.open = '1';
        const im = o.querySelector('[data-rimg]') as HTMLElement;
        gsap.fromTo(im, { height: 0, marginTop: 0 }, { height: 'auto', marginTop: 12, duration: 1, ease: 'expo.out' });
        gsap.fromTo(im.firstElementChild, { scale: 1.15 }, { scale: 1, duration: 1.4, ease: 'expo.out' });
      }),
    );

    // --- carrousel: input ---
    const step = (d: number) => {
      const now = performance.now();
      if (now - lastMove < 450) return;
      lastMove = now;
      target += d;
      lastStep = now;
      lastInput = now;
    };
    const cine = q('[data-cine]');
    on(cine, 'wheel', ((e: WheelEvent) => {
      if (mode !== 'cine') return;
      e.preventDefault();
      acc += e.deltaY;
      if (Math.abs(acc) > 40) { step(Math.sign(acc)); acc = 0; }
    }) as EventListener, { passive: false });
    let t0: { x: number; y: number } | null = null;
    on(cine, 'touchstart', ((e: TouchEvent) => { t0 = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }) as EventListener, { passive: true });
    on(cine, 'touchmove', ((e: TouchEvent) => {
      if (!t0) return;
      const x = e.touches[0].clientX, y = e.touches[0].clientY, dx = t0.x - x, dy = t0.y - y;
      const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(d) > 36) { step(Math.sign(d)); t0 = { x, y }; }
    }) as EventListener, { passive: true });
    on(cine, 'touchend', () => { t0 = null; }, { passive: true });
    on(window, 'keydown', ((e: KeyboardEvent) => {
      if (mode !== 'cine') return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') step(-1);
    }) as EventListener);
    cards.forEach((c) =>
      on(c, 'click', () => {
        const n = cards.length, i = Number(c.dataset.i);
        const curI = ((Math.round(pos) % n) + n) % n;
        let d = i - curI;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        if (d !== 0) { lastMove = 0; step(d); }
      }),
    );

    // --- título / tipo / contador ---
    const titleEl = q('[data-title]'), typeEl = q('[data-type]'), numEl = q('[data-num]');
    let titleChars = split(titleEl, PROJECTS[0].name);
    const setActive = (i: number) => {
      if (i === active) return;
      const dir = i > active ? 1 : -1;
      active = i;
      const P = PROJECTS[i];
      const old = titleChars;
      titleTl?.kill();
      titleTl = gsap.timeline()
        .to(old, { yPercent: -110 * dir, duration: 0.45, ease: 'power2.in', stagger: 0.015 })
        .to([typeEl, numEl], { opacity: 0, y: -8 * dir, filter: 'blur(4px)', duration: 0.35, ease: 'power2.in' }, 0)
        .add(() => {
          titleChars = split(titleEl, P.name);
          typeEl.textContent = t(P.type);
          numEl.innerHTML = `${P.num} <span style="color:#5A5955;">/ ${pad2(PROJECTS.length)}</span>`;
          gsap.fromTo(titleChars, { yPercent: 110 * dir }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.03 });
          gsap.fromTo([numEl, typeEl], { opacity: 0, y: 10 * dir, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.06 });
        });
    };

    // --- cambio de vista ---
    const setMode = (m: 'cine' | 'list') => {
      if (m === mode || busy) return;
      busy = true;
      qa('[data-mode]').forEach((b) => {
        const onB = b.dataset.mode === m;
        b.style.color = onB ? '#F4F3F1' : '#5A5955';
        b.setAttribute('aria-pressed', String(onB));
        (b.querySelector('[data-dot]') as HTMLElement).style.transform = `scale(${onB ? 1 : 0})`;
      });
      showCur(false);
      const from = q(m === 'list' ? '[data-cine]' : '[data-list]');
      const to = q(m === 'list' ? '[data-list]' : '[data-cine]');
      gsap.to(from, {
        opacity: 0, y: -30, filter: 'blur(12px)', duration: 0.7, ease: 'power2.inOut',
        onComplete: () => {
          from.style.display = 'none';
          gsap.set(from, { clearProps: 'opacity,transform,filter' });
          to.style.display = 'block';
          window.scrollTo(0, 0);
          mode = m;
          if (m === 'list') {
            gsap.fromTo(qa('[data-rname]'), { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.07 });
            gsap.fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'sine.out', onComplete: () => { busy = false; } });
          } else {
            gsap.set(fl, { clipPath: 'inset(50% 50% 50% 50%)' });
            resetRows();
            intro = 0;
            gsap.fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'sine.out' });
            const st = { v: 0 };
            gsap.to(st, { v: 1, duration: 2, ease: 'expo.out', onUpdate: () => { intro = st.v; }, onComplete: () => { busy = false; } });
          }
        },
      });
    };

    // --- intro: las fotos llegan desde el fondo y el título sube letra por letra ---
    const st = { v: 0 };
    const tl = gsap.timeline()
      .to(st, { v: 1, duration: 2.4, ease: 'expo.out', onUpdate: () => { intro = st.v; } }, 0.1)
      .from(titleChars, { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.035 }, 0.5)
      .from([numEl, typeEl], { opacity: 0, y: 14, filter: 'blur(6px)', duration: 1.2, ease: 'power3.out', stagger: 0.1 }, 0.9)
      .to([q('[data-head]'), q('[data-views]')], { opacity: 1, duration: 1.2, ease: 'sine.out', stagger: 0.15 }, 0.8)
      .to(q('[data-hint]'), { opacity: 1, duration: 1.2, ease: 'sine.out' }, 1.4);
    if (reduced) tl.progress(1);

    // --- loop ---
    const timer = q('[data-timer]'), hint = q('[data-hint]');
    const sm = (e0: number, e1: number, v: number) => {
      const k = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)));
      return k * k * (3 - 2 * k);
    };
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const km = 1 - Math.exp(-dt * 2.2);
      mxS += (mx - mxS) * km;
      myS += (my - myS) * km;
      if (cx != null && cy != null) { curX(cx); curY(cy); }

      if (mode === 'list') {
        if (cx != null && cy != null) { flX(cx); flY(cy); }
        return;
      }
      const n = cards.length, H = window.innerHeight, AUTO = 4200;
      if (!reduced && intro > 0.9 && now - lastStep > AUTO && now - lastInput > 2500) { target += 1; lastStep = now; }
      timer.style.transform = `scaleX(${Math.min(1, (now - lastStep) / AUTO).toFixed(4)})`;
      pos += (target - pos) * (1 - Math.exp(-dt * 5.2));
      const f = pos;
      setActive(((Math.round(f) % n) + n) % n);
      hint.style.opacity = String(Math.min(1, intro) * (now - lastInput > 6000 ? 1 : 0));
      const it = 1 - Math.pow(1 - Math.min(1, intro), 3);
      for (let i = 0; i < n; i++) {
        const c = cards[i];
        let r = (((i - f) % n) + n) % n;
        if (r > n / 2) r -= n; // bucle infinito
        const a = Math.abs(r), sg = Math.sign(r);
        const s = Math.max(0.4, 1 - Math.min(a, 3) * 0.24);
        const y = sg * (1 - Math.pow(0.5, a)) * 2 * H * 0.19 + (1 - it) * H * 0.4;
        const z = -a * 160;
        const op = (1 - sm(1.7, 2.6, a)) * sm(0, 1, it * 1.6 - a * 0.25);
        const blur = Math.min(6, a * 1.6);
        const bright = 1 - Math.min(0.55, a * 0.32);
        const X = isM ? sg * (1 - Math.pow(0.5, a)) * 2 * window.innerWidth * 0.36 : mxS * -10 * (1 + a);
        const Y = isM ? (1 - it) * H * 0.3 : y;
        c.style.transform = `translate(-50%,-50%) translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,${z.toFixed(1)}px) scale(${s.toFixed(4)})`;
        c.style.opacity = op.toFixed(3);
        c.style.filter = blur > 0.2 ? `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(3)})` : 'none';
        c.style.zIndex = String(100 - Math.round(a * 10));
        c.style.pointerEvents = a < 1.6 ? 'auto' : 'none';
        const img = c.firstElementChild as HTMLElement | null;
        if (img) {
          img.style.transform = `translate3d(${(isM ? r * -28 : mxS * -14).toFixed(1)}px,${(isM ? 0 : r * -36 + myS * -10).toFixed(1)}px,0) scale(${(1 + a * 0.05).toFixed(3)})`;
        }
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      tl.kill();
      titleTl?.kill();
      gsap.killTweensOf(root.querySelectorAll('*'));
    };
  }, [t]);

  const first = PROJECTS[0];

  return (
    <div
      ref={rootRef}
      style={{ background: '#090906', color: '#F4F3F1', fontFamily: MONT, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}
    >
      <header
        data-head
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: 'clamp(14px,2.4svh,26px) clamp(16px,2vw,40px)', opacity: 0 }}
      >
        <Link
          href="/"
          aria-label={t({ es: 'Laure — inicio', en: 'Laure — home' })}
          style={{ fontFamily: ANIMO, fontWeight: 400, fontSize: 'clamp(22px,1.8vw,30px)', lineHeight: 1, letterSpacing: '-.05em', textTransform: 'uppercase', color: '#F4F3F1' }}
        >
          Laure
        </Link>
        {/* mismo botón que el header de la home */}
        <ContactButton />
      </header>

      <nav
        data-views
        aria-label={t({ es: 'Vista', en: 'View' })}
        style={{ position: 'fixed', right: 'clamp(16px,2vw,40px)', top: '50%', transform: 'translateY(-50%)', zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, opacity: 0 }}
      >
        {([
          ['cine', { es: 'Carrousel', en: 'Carousel' }],
          ['list', { es: 'Lista', en: 'List' }],
        ] as const).map(([m, label]) => (
          <button
            key={m}
            data-mode={m}
            aria-pressed={m === 'cine'}
            style={{ display: 'flex', alignItems: 'center', gap: 10, border: 0, background: 'none', padding: '4px 0', fontFamily: MONT, fontSize: 'clamp(13px,1vw,15px)', color: m === 'cine' ? '#F4F3F1' : '#5A5955', transition: 'color .6s ease' }}
          >
            <span data-dot style={{ width: 6, height: 6, borderRadius: '50%', background: '#F4F3F1', transform: `scale(${m === 'cine' ? 1 : 0})`, transition: 'transform .6s cubic-bezier(.22,1,.36,1)' }} />
            <span style={{ display: 'block', overflow: 'hidden', height: '1.3em', lineHeight: '1.3em' }}>
              <span data-roll style={{ display: 'block' }}>{t(label)}</span>
              <span data-roll aria-hidden style={{ display: 'block' }}>{t(label)}</span>
            </span>
          </button>
        ))}
      </nav>

      {/* MODO CARROUSEL */}
      <section
        data-cine
        data-lenis-prevent
        aria-label={t({ es: 'Proyectos — Carrousel', en: 'Projects — Carousel' })}
        style={{ position: 'relative', isolation: 'isolate', height: '100svh', minHeight: 620, overflow: 'hidden' }}
      >
        <div data-stack style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
          {PROJECTS.map((p, i) => (
            <div
              key={p.name}
              data-c
              data-i={i}
              role="img"
              aria-label={p.name}
              style={{ position: 'absolute', left: 0, top: 0, width: 'clamp(220px,23vw,400px)', aspectRatio: '3 / 4', overflow: 'hidden', background: '#141411', opacity: 0, transform: 'translate(-50%,-50%)', willChange: 'transform,opacity,filter' }}
            >
              <img
                src={p.img}
                alt=""
                draggable={false}
                style={{ position: 'absolute', left: '-6%', top: '-6%', width: '112%', height: '112%', maxWidth: 'none', objectFit: 'cover', display: 'block', willChange: 'transform' }}
              />
            </div>
          ))}
        </div>

        <div
          data-info
          style={{ position: 'absolute', left: 'clamp(16px,3vw,56px)', top: '50%', transform: 'translateY(-50%)', width: 'min(30vw,520px)', display: 'flex', flexDirection: 'column', gap: 'clamp(16px,2.4vh,28px)', pointerEvents: 'none' }}
        >
          <h1
            data-title
            aria-live="polite"
            style={{ margin: 0, fontFamily: ANIMO, fontWeight: 400, textTransform: 'uppercase', fontSize: 'clamp(40px,5.6vw,112px)', lineHeight: 0.88, letterSpacing: '-.05em' }}
          >
            {first.name}
          </h1>
          <p data-type style={{ margin: 0, maxWidth: '34ch', fontSize: 'clamp(13px,1vw,15px)', lineHeight: 1.5, color: '#9C9B96' }}>
            {t(first.type)}
          </p>
        </div>

        <div
          data-counter
          style={{ position: 'absolute', right: 'clamp(16px,3vw,56px)', bottom: 'clamp(24px,5vh,48px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, pointerEvents: 'none' }}
        >
          <span data-num style={{ fontFamily: ANIMO, fontSize: 'clamp(22px,2vw,32px)', letterSpacing: '-.03em', fontVariantNumeric: 'tabular-nums' }}>
            {first.num} <span style={{ color: '#5A5955' }}>/ {pad2(PROJECTS.length)}</span>
          </span>
          <span style={{ position: 'relative', display: 'block', width: 72, height: 1, background: '#26261F', overflow: 'hidden' }}>
            <span data-timer style={{ position: 'absolute', inset: 0, background: '#9C9B96', transformOrigin: '0 50%', transform: 'scaleX(0)' }} />
          </span>
        </div>
        <div
          data-hint
          style={{ position: 'absolute', left: 'clamp(16px,3vw,56px)', bottom: 'clamp(24px,5vh,48px)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#5A5955', opacity: 0 }}
        >
          {t({ es: 'Scroll hacia abajo', en: 'Scroll down' })}
        </div>
      </section>

      {/* MODO LISTA */}
      <section
        data-list
        aria-label={t({ es: 'Proyectos — Lista', en: 'Projects — List' })}
        style={{ display: 'none', isolation: 'isolate', padding: 'clamp(120px,18vh,180px) clamp(130px,12vw,200px) clamp(80px,14vh,160px) clamp(16px,3vw,56px)' }}
      >
        {PROJECTS.map((p, i) => (
          <div
            key={p.name}
            data-row
            data-i={i}
            style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'clamp(40px,5vw,80px) minmax(0,1fr) auto', alignItems: 'center', gap: 20, padding: 'clamp(10px,1.6vh,18px) 0' }}
          >
            <span style={{ fontSize: 13, color: '#5A5955', fontVariantNumeric: 'tabular-nums' }}>{p.num}</span>
            <span style={{ display: 'block', overflow: 'hidden', paddingTop: '.06em' }}>
              <span
                data-rname
                style={{ display: 'block', fontFamily: ANIMO, textTransform: 'uppercase', fontSize: 'clamp(28px,3.8vw,68px)', lineHeight: 0.92, letterSpacing: '-.05em', transition: 'transform 1s cubic-bezier(.22,1,.36,1), color .6s ease' }}
              >
                {p.name}
              </span>
            </span>
            <span
              data-rtype
              style={{ maxWidth: '28ch', fontSize: 'clamp(12px,1vw,14px)', lineHeight: 1.45, color: '#9C9B96', textAlign: 'right', transition: 'color .6s ease' }}
            >
              {t(p.type)}
            </span>
            <span data-rimg style={{ gridColumn: '1 / -1', display: 'none', height: 0, overflow: 'hidden' }}>
              <img src={p.img} alt={p.name} style={{ display: 'block', width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }} />
            </span>
          </div>
        ))}
      </section>

      <div
        data-float
        aria-hidden
        style={{ position: 'fixed', left: 0, top: 0, width: 'clamp(240px,24vw,420px)', aspectRatio: '4 / 3', overflow: 'hidden', pointerEvents: 'none', zIndex: 30, clipPath: 'inset(50% 50% 50% 50%)', background: '#141411' }}
      >
        {PROJECTS.map((p) => (
          <img
            key={p.name}
            data-fimg
            src={p.img}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0, transform: 'scale(1.15)' }}
          />
        ))}
      </div>

      <div
        data-cursor
        aria-hidden
        style={{ position: 'fixed', left: 0, top: 0, zIndex: 200, pointerEvents: 'none', background: '#FFFFFF', color: '#111110', padding: '11px 16px', fontWeight: 600, fontSize: 12, letterSpacing: '.02em', textTransform: 'uppercase', whiteSpace: 'nowrap', transform: 'translate(-50%,-50%) scale(0)' }}
      >
        {t({ es: 'Ver proyecto', en: 'View project' })}
      </div>

      <div
        data-grain
        aria-hidden
        style={{ position: 'fixed', inset: '-50%', zIndex: 45, pointerEvents: 'none', opacity: 0.06, mixBlendMode: 'overlay', backgroundSize: '180px 180px' }}
      />
    </div>
  );
}
