'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useRevealOnScroll } from '@/lib/reveal';
import { useContactModal } from '@/lib/contact-modal';
import { useLanguage } from '@/lib/language';
import Photo from './Photo';

/**
 * cta-band — port fiel del HTML. Banda de 160vh con imagen de fondo (parallax),
 * título "Let's Build / Something / Great / → Together" con reveal, y CTA.
 * "→ Together" deriva a la derecha con el scroll.
 */
export default function CtaBand() {
  const { t } = useLanguage();
  const scopeRef = useRef<HTMLElement>(null);
  const togetherRef = useRef<HTMLSpanElement>(null);
  const togInnerRef = useRef<HTMLSpanElement>(null);
  const { open: openContactModal } = useContactModal();

  useRevealOnScroll(scopeRef);

  useGSAP(
    () => {
      const scope = scopeRef.current;
      const tog = togetherRef.current;
      const inner = togInnerRef.current;
      if (!scope || !tog) return;
      const tick = () => {
        const r = scope.getBoundingClientRect();
        const total = Math.max(scope.offsetHeight - window.innerHeight, 1);
        const p = Math.min(Math.max(-r.top / total, 0), 1);
        // desplazamiento máximo: hasta que el borde derecho del texto alcance el
        // borde derecho del h2 (donde termina "Something").
        const h2 = tog.parentElement;
        const maxShift = inner && h2 ? Math.max((h2.clientWidth - inner.offsetWidth) / 2, 0) : 0;
        tog.style.transform = `translateX(${p * maxShift}px)`;
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: scopeRef },
  );

  const line: React.CSSProperties = { display: 'block' };

  return (
    <section id="cta-band" ref={scopeRef} style={{ position: 'relative', zIndex: 5, height: '160vh', background: '#050505', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, filter: 'grayscale(1) contrast(1.2) brightness(0.6)' }}>
          <Photo src="/images/cta-bg.jpg" alt="" style={{ height: '100%' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.5) 0%, rgba(5,5,5,0.2) 45%, rgba(5,5,5,0.75) 100%)' }} />

        <div style={{ position: 'sticky', top: 0, height: '160vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 clamp(28px, 4vw, 72px)', boxSizing: 'border-box' }}>
          <h2
            data-up
            style={{ margin: 0, width: '100%', maxWidth: 1040, fontFamily: 'var(--font-animo), var(--font-display)', fontWeight: 700, fontVariationSettings: '"wdth" 500', fontSize: 'clamp(44px, 8.8vw, 172px)', lineHeight: 0.9, letterSpacing: '-0.045em', textTransform: 'uppercase', color: '#f4f3f1' }}
          >
            <span style={{ ...line, textAlign: 'left' }}>{t({ es: 'Construyamos', en: "Let's Build" })}</span>
            <span style={{ ...line, textAlign: 'right' }}>{t({ es: 'Algo', en: 'Something' })}</span>
            <span style={{ ...line, textAlign: 'left' }}>{t({ es: 'Grande', en: 'Great' })}</span>
            <span ref={togetherRef} style={{ ...line, textAlign: 'center', willChange: 'transform' }}>
              <span ref={togInnerRef} style={{ display: 'inline-block' }}>
                <span style={{ fontSize: '0.7em' }}>→</span> {t({ es: 'Juntos', en: 'Together' })}
              </span>
            </span>
          </h2>
          <a
            className="foot-cta"
            data-up
            href="#contacto"
            onClick={(e) => {
              e.preventDefault();
              openContactModal();
            }}
            style={{ marginTop: 'clamp(28px, 4vh, 52px)', display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 24px', background: '#f4f3f1', color: '#090906', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', transition: 'opacity 0.4s ease' }}
          >
            {t({ es: 'Hablemos', en: 'Talk with me' })}{' '}
            <span className="foot-arrow" style={{ display: 'inline-block', transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
