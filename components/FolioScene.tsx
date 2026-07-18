'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap, useGSAP } from '@/lib/gsap';
import { useLanguage } from '@/lib/language';

const PHOTOS = ['/images/portfolio-1.jpg', '/images/portfolio-2.jpg', '/images/portfolio-3.jpg'];

const smoothstep = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * FolioScene — "MY · PORT / FOLIO". Port fiel del HTML.
 * Escena negra de 200vh anidada en el #scroll-root del hero (absolute, bottom),
 * que sube por encima del hero. Scroll-driven (lerp 0.08): PORT/FOLIO convergen
 * (convergencia completa al 65%), foto central 3:4 escala 0→1 y rota entre 3
 * fotos cada 1.5s (crossfade lerp 0.12), "My" se abre a sfp>0.72, wobble+rotate
 * sinusoidal opuesto. Su tick además atenúa el brillo y desplaza el hero detrás.
 */
export default function FolioScene() {
  const { t } = useLanguage();
  const sceneRef = useRef<HTMLElement>(null);
  const portRef = useRef<HTMLSpanElement>(null);
  const folioRef = useRef<HTMLSpanElement>(null);
  const myRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const scene = sceneRef.current;
      const portTxt = portRef.current;
      const folioTxt = folioRef.current;
      const folioImg = imgRef.current;
      const myTxt = myRef.current;
      if (!scene || !portTxt || !folioTxt || !folioImg) return;

      let fp = 0;
      let sfp = 0;

      const onScroll = () => {
        const rect = scene.getBoundingClientRect();
        const vh = window.innerHeight;
        fp = clamp01((vh - rect.top) / scene.offsetHeight);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      // elementos del hero que este tick atenúa/desplaza
      const heroRoot = document.getElementById('hero-root');
      const dimTargets = () =>
        document.querySelectorAll<HTMLElement>(
          '#headline-top, #headline-bottom, #hero-root .hero-meta, #about-block, #canvas-host',
        );

      const tick = () => {
        sfp += (fp - sfp) * 0.08;
        const c = Math.min(sfp / 0.65, 1);
        const e = smoothstep(c);
        const off = (1 - e) * 42; // vw

        if (heroRoot) heroRoot.style.transform = `translateY(${-sfp * 22}vh)`;

        if (myTxt) {
          const mp = smoothstep(clamp01((sfp - 0.72) / 0.26));
          myTxt.style.maxWidth = `${mp * 1.6}em`;
          myTxt.style.opacity = String(mp);
        }

        const dimVal = 1 - Math.min(sfp * 1.6, 0.85);
        dimTargets().forEach((el) => {
          el.style.filter = sfp > 0.01 ? `brightness(${dimVal})` : '';
        });

        // rotación de fotos cada 1.5s
        const idx = Math.floor(performance.now() / 1500) % PHOTOS.length;
        photoRefs.current.forEach((ph, i) => {
          if (!ph) return;
          const target = i === idx ? 1 : 0;
          const cur = parseFloat(ph.style.opacity) || 0;
          ph.style.opacity = String(cur + (target - cur) * 0.12);
        });

        const wob = Math.sin(performance.now() / 900) * 1.2;
        portTxt.style.transform = `translateX(${-off}vw) translateY(${wob}px) rotate(${-wob * 0.15}deg)`;
        folioTxt.style.transform = `translateX(${off}vw) translateY(${-wob}px) rotate(${wob * 0.15}deg)`;
        folioImg.style.transform = `translate(-50%, -50%) scale(${e})`;
      };

      gsap.ticker.add(tick);

      return () => {
        window.removeEventListener('scroll', onScroll);
        gsap.ticker.remove(tick);
      };
    },
    { scope: sceneRef },
  );

  const wordStyle: React.CSSProperties = {
    fontFamily: 'var(--font-animo), var(--font-display)',
    fontWeight: 700,
    // Ancho del glifo vía eje variable (0=angosto … 1000=ancho). 500 ≈ R500.
    fontVariationSettings: '"wdth" 500',
    fontSize: 'clamp(70px, 11vw, 190px)',
    lineHeight: 1,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
    color: '#f4f3f1',
    willChange: 'transform',
  };

  return (
    <section
      id="folio-scene"
      ref={sceneRef}
      aria-label={t({ es: 'Portafolio', en: 'Portfolio' })}
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '200vh', zIndex: 4 }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          background: '#090906',
          color: '#f4f3f1',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* foto central 3:4, escala con el scroll */}
        <div
          id="folio-img"
          ref={imgRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 'clamp(180px, 16vw, 260px)',
            aspectRatio: '3 / 4',
            transform: 'translate(-50%, -50%) scale(0)',
            willChange: 'transform',
            zIndex: 1,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {PHOTOS.map((src, i) => (
            <div
              key={src}
              ref={(el) => {
                photoRefs.current[i] = el;
              }}
              style={{ position: 'absolute', inset: 0, opacity: i === 0 ? 1 : 0 }}
            >
              <Image src={src} alt="Laureano" fill priority unoptimized sizes="(max-width: 768px) 40vw, 16vw" style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        {/* PORT / FOLIO */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', pointerEvents: 'none' }}>
          <span ref={portRef} style={{ ...wordStyle, marginRight: 'clamp(10px, 1.2vw, 24px)' }}>
            <span
              ref={myRef}
              style={{ display: 'inline-block', maxWidth: 0, opacity: 0, overflow: 'hidden', verticalAlign: 'bottom', willChange: 'max-width, opacity' }}
            >
              {t({ es: 'Mi ', en: 'My ' })}
            </span>
            {t({ es: 'Porta', en: 'Port' })}
          </span>
          <span ref={folioRef} style={{ ...wordStyle, marginLeft: 'clamp(10px, 1.2vw, 24px)' }}>
            {t({ es: 'folio', en: 'Folio' })}
          </span>
        </div>

        {/* descripción */}
        <p
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 'clamp(36px, 7vh, 80px)',
            transform: 'translateX(-50%)',
            zIndex: 2,
            maxWidth: 420,
            margin: 0,
            textAlign: 'center',
            fontWeight: 500,
            fontSize: 15,
            lineHeight: 1.6,
            color: '#9a9a9a',
          }}
        >
          {t({
            es: 'Una selección de proyectos donde el diseño, el código y el movimiento se encuentran — construidos de punta a punta, desde el primer boceto hasta la interacción final. Actualmente disponible para nuevas colaboraciones.',
            en: 'A selection of projects where design, code and motion meet — built end to end, from first sketch to final interaction. Currently open for new collaborations.',
          })}
        </p>
      </div>
    </section>
  );
}
