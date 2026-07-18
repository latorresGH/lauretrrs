'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useRevealOnScroll } from '@/lib/reveal';
import { useLanguage, type Localized } from '@/lib/language';

const FAQS: { q: Localized; a: Localized }[] = [
  {
    q: { es: '¿Quién va a trabajar realmente en mi proyecto?', en: 'Who actually works on my project?' },
    a: {
      es: 'Yo, de principio a fin. Trabajás directo con quien diseña y programa — sin intermediarios ni equipos rotando.',
      en: 'Me, start to finish. You work directly with the person designing and coding — no middlemen, no rotating teams.',
    },
  },
  {
    q: { es: '¿Cuánto suele tardar un proyecto?', en: 'How long does a project usually take?' },
    a: {
      es: 'Depende del alcance, pero la mayoría entra entre 3 y 8 semanas. Definimos etapas claras así siempre sabés en qué punto estamos.',
      en: 'It depends on scope, but most projects fall between 3 and 8 weeks. We set clear stages so you always know where things stand.',
    },
  },
  {
    q: { es: '¿Cómo es la comunicación durante el proyecto?', en: "What's communication like during the project?" },
    a: {
      es: 'Updates frecuentes y avances reales cada semana. Nada de silencios largos: siempre vas a poder ver cómo progresa.',
      en: "Frequent updates and real progress every week. No long silences — you'll always be able to see how it's moving forward.",
    },
  },
  {
    q: { es: '¿Qué necesitás para empezar?', en: 'What do you need to get started?' },
    a: {
      es: 'Una charla inicial para entender el objetivo y cualquier material que ya tengas. Con eso armo el plan y arrancamos.',
      en: 'An initial chat to understand the goal, plus any material you already have. From there I put together the plan and we kick off.',
    },
  },
  {
    q: { es: '¿Qué pasa después del lanzamiento?', en: 'What happens after launch?' },
    a: {
      es: 'Seguimiento, métricas y soporte. El proyecto no termina al publicarse — me quedo para que siga creciendo.',
      en: "Follow-up, metrics and support. The project doesn't end at launch — I stick around to help it keep growing.",
    },
  },
];

/**
 * faq-sec — port fiel del HTML. Columna izquierda sticky (label + CTA), derecha
 * título + acordeón. Cada item expande su body (height: scrollHeight) y rota el
 * icono +/−.
 */
export default function FaqSection() {
  const { t } = useLanguage();
  const scopeRef = useRef<HTMLElement>(null);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const qRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const openState = useRef<boolean[]>([]);

  useRevealOnScroll(scopeRef);

  // --- hover: el item se pinta de blanco cálido y el texto se invierte a oscuro ---
  const WARM = '#f4efe4';
  const onEnter = (i: number) => {
    gsap.to(itemRefs.current[i], { backgroundColor: WARM, paddingLeft: 22, paddingRight: 22, duration: 0.55, ease: 'power3.out' });
    gsap.to([qRefs.current[i], iconRefs.current[i], pRefs.current[i]].filter(Boolean), { color: '#090906', duration: 0.55, ease: 'power3.out' });
  };
  const onLeave = (i: number) => {
    gsap.to(itemRefs.current[i], { backgroundColor: 'rgba(244,239,228,0)', paddingLeft: 0, paddingRight: 0, duration: 0.55, ease: 'power3.out' });
    gsap.to(qRefs.current[i], { color: '#f4f3f1', duration: 0.55, ease: 'power3.out' });
    gsap.to(iconRefs.current[i], { color: '#8a8a8a', duration: 0.55, ease: 'power3.out' });
    gsap.to(pRefs.current[i], { color: '#9a9a96', duration: 0.55, ease: 'power3.out' });
  };

  const toggle = (i: number) => {
    const body = bodyRefs.current[i];
    const ic = iconRefs.current[i];
    if (!body) return;
    const open = openState.current[i];
    if (!open) {
      openState.current[i] = true;
      gsap.to(body, { height: body.scrollHeight, duration: 0.7, ease: 'power3.inOut', onComplete: () => { body.style.height = 'auto'; } });
      if (body.firstElementChild) gsap.fromTo(body.firstElementChild, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.12 });
      if (ic) { ic.textContent = '−'; ic.style.transform = 'rotate(180deg)'; }
    } else {
      openState.current[i] = false;
      body.style.height = `${body.scrollHeight}px`;
      gsap.to(body, { height: 0, duration: 0.5, ease: 'power3.inOut' });
      if (ic) { ic.textContent = '+'; ic.style.transform = 'rotate(0deg)'; }
    }
  };

  return (
    <section
      id="faq-sec"
      ref={scopeRef}
      style={{ position: 'relative', zIndex: 5, background: '#090906', color: '#f4f3f1', boxSizing: 'border-box', fontFamily: 'var(--font-main)', display: 'grid', gridTemplateColumns: 'minmax(240px, 0.8fr) 2fr', gap: 'clamp(40px, 5vw, 100px)', padding: 'clamp(80px, 12vh, 150px) clamp(28px, 4vw, 72px)' }}
    >
      {/* LEFT */}
      <div>
        <div className="faq-left-sticky" style={{ position: 'sticky', top: 'clamp(90px, 12vh, 140px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#8a8a8a' }} />
            {t({ es: 'A tener en cuenta', en: 'Good to know' })}
          </div>
          <div className="faq-left-cta-wrap" style={{ marginTop: 'clamp(40px, 30vh, 320px)' }}>
            <div style={{ fontWeight: 500, fontSize: 17, lineHeight: 1.4, color: '#8a8a8a', maxWidth: 220 }}>
              {t({ es: '¿Tenés más preguntas?', en: 'Got more questions?' })}
              <br />
              {t({ es: 'Hablemos.', en: "Let's talk." })}
            </div>
            <a className="foot-cta" href="#cta-band" style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 24px', background: '#f4f3f1', color: '#090906', fontWeight: 700, fontSize: 14, transition: 'opacity 0.4s ease' }}>
              {t({ es: '¿Querés consultar algo?', en: 'Want to ask something?' })}{' '}
              <span className="foot-arrow" style={{ display: 'inline-block', transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
                ↗
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div>
        <h2 data-up style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(34px, 4.4vw, 76px)', lineHeight: 1.02, letterSpacing: '-0.035em' }}>
          {t({ es: 'Esto es lo que conviene', en: "Here's what's worth" })}
          <br />
          {t({ es: 'saber antes de trabajar juntos.', en: 'knowing before we work together.' })}
        </h2>

        <div style={{ marginTop: 'clamp(40px, 6vh, 80px)' }}>
          {FAQS.map((item, i) => (
            <div
              key={item.q.en}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onMouseEnter={() => onEnter(i)}
              onMouseLeave={() => onLeave(i)}
              style={{ borderTop: '1px solid #2a2a28', borderBottom: i === FAQS.length - 1 ? '1px solid #2a2a28' : undefined, backgroundColor: 'rgba(244,239,228,0)', willChange: 'background-color, padding' }}
            >
              <div
                onClick={() => toggle(i)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: 'clamp(22px, 3vh, 32px) 0', cursor: 'none' }}
              >
                <span
                  ref={(el) => {
                    qRefs.current[i] = el;
                  }}
                  style={{ fontWeight: 700, fontSize: 'clamp(18px, 1.7vw, 24px)', letterSpacing: '-0.01em' }}
                >
                  {t(item.q)}
                </span>
                <span
                  ref={(el) => {
                    iconRefs.current[i] = el;
                  }}
                  style={{ fontSize: 22, color: '#8a8a8a', transition: 'transform 0.4s ease' }}
                >
                  +
                </span>
              </div>
              <div
                ref={(el) => {
                  bodyRefs.current[i] = el;
                }}
                style={{ overflow: 'hidden', height: 0 }}
              >
                <p
                  ref={(el) => {
                    pRefs.current[i] = el;
                  }}
                  style={{ margin: '0 0 clamp(22px, 3vh, 32px)', maxWidth: 620, fontWeight: 500, fontSize: 15, lineHeight: 1.6, color: '#9a9a96' }}
                >
                  {t(item.a)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
