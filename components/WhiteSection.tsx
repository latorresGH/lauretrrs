'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useRevealOnScroll } from '@/lib/reveal';
import { useLanguage } from '@/lib/language';
import Photo from './Photo';

const serif: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontWeight: 400,
  textTransform: 'lowercase',
  letterSpacing: 0,
};

const tagStyle: React.CSSProperties = {
  padding: '7px 14px',
  border: '1px solid #dcdad5',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

/**
 * white-next — port fiel del HTML. Escena editorial blanca:
 *  Block 1: recorrido / educación IES Santa Fe.
 *  Block 2: proyecto "Plataforma de Streaming" (foto a la derecha).
 *  Block 3: proyecto "Guardería Náutica" (foto a la izquierda).
 * Reveals de texto/imagen + parallax + blur según cercanía al centro del viewport.
 */
export default function WhiteSection() {
  const { t } = useLanguage();
  const scopeRef = useRef<HTMLElement>(null);
  useRevealOnScroll(scopeRef);

  // parallax + focus-blur de las imágenes (per-frame)
  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return;
      const imgs = Array.from(scope.querySelectorAll<HTMLElement>('[data-img]'));

      const tick = () => {
        const r = scope.getBoundingClientRect();
        const vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        imgs.forEach((el) => {
          const rr = el.getBoundingClientRect();
          const child = el.firstElementChild as HTMLElement | null;
          if (!child) return;
          const center = rr.top + rr.height / 2;
          // parallax
          const p = (center - vh / 2) / vh;
          const amt = parseFloat(el.dataset.par || '0.12');
          if (!gsap.isTweening(child)) child.style.transform = `translateY(${p * amt * -100}px)`;
          // focus blur
          let t = Math.min(Math.max((Math.abs(center - vh / 2) / (vh / 2) - 0.25) / 0.7, 0), 1);
          t = t * t * (3 - 2 * t);
          child.style.filter = `blur(${(t * 6).toFixed(1)}px)`;
        });
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: scopeRef },
  );

  return (
    <section
      id="procesos"
      ref={scopeRef}
      style={{
        position: 'relative',
        zIndex: 5,
        background: '#f4f3f1',
        color: '#1a1a1a',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'var(--font-main)',
      }}
    >
      {/* ===== BLOCK 1: headline + educación ===== */}
      <div className="wh-block" style={{ position: 'relative', minHeight: '130vh' }}>
        <div
          data-up
          className="wh-corner-label"
          style={{
            position: 'absolute',
            top: 'clamp(60px, 9vh, 110px)',
            left: 'clamp(28px, 4vw, 72px)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            lineHeight: 1.7,
          }}
        >
          Laureano
          <br />
          Dev
        </div>
        <div
          data-up
          className="wh-corner-label"
          style={{
            position: 'absolute',
            top: 'clamp(180px, 34vh, 380px)',
            right: 'clamp(28px, 4vw, 72px)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            lineHeight: 1.7,
            textAlign: 'right',
          }}
        >
          {t({ es: 'Formación y proyectos', en: 'Training & Projects' })}
          <br />
          2023 — 2025
        </div>

        <div className="wh-intro" style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(70px, 10vh, 120px) 24px 0', textAlign: 'center' }}>
          <div data-up style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase' }}>
            {t({ es: 'Bienvenido a', en: 'Welcome to' })}
          </div>
          <h2
            className="wh-heading"
            style={{
              margin: 'clamp(28px, 5vh, 56px) 0 0',
              fontWeight: 700,
              fontSize: 'clamp(52px, 7.2vw, 128px)',
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            <span data-up style={{ display: 'block' }}>
              {t({ es: 'Mi recorrido', en: 'My journey' })} <span style={serif}>{t({ es: 'de', en: 'of' })}</span>
            </span>
            <span data-up style={{ display: 'block' }}>
              <span style={serif}>{t({ es: 'tres', en: 'three' })}</span> {t({ es: 'años', en: 'years' })}{' '}
              <span style={serif}>{t({ es: 'en', en: 'in' })}</span>
            </span>
            <span data-up style={{ display: 'block' }}>
              Software{' '}
              <span data-up style={{ display: 'inline-block', verticalAlign: 'baseline', fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', marginLeft: 14 }}>
                {t({ es: 'AKA LA TECNICATURA', en: 'AKA THE DEGREE' })}
              </span>
            </span>
          </h2>
        </div>

        {/* IES photo — recortada al borde izquierdo */}
        <div
          data-img
          data-par="0.2"
          className="wh-photo"
          style={{
            position: 'absolute',
            left: 0,
            top: 'clamp(360px, 56vh, 620px)',
            width: 'clamp(260px, 24vw, 430px)',
            aspectRatio: '4 / 5',
            overflow: 'hidden',
            willChange: 'transform',
          }}
        >
          <Photo src="/images/ies-santa-fe.jpg" alt="IES Santa Fe" style={{ height: '118%' }} />
        </div>

        {/* IES story — desplazada center-right */}
        <div className="wh-text" style={{ maxWidth: 560, margin: 'clamp(120px, 20vh, 220px) auto 0', padding: '0 24px', transform: 'translateX(6vw)' }}>
          <div data-up>
            <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(24px, 2.4vw, 36px)', lineHeight: 1.35 }}>
              {t({
                es: 'Tres años en el IES Santa Fe — Tecnicatura en Desarrollo de Software. De los diagramas UML y el modelado de datos a metodologías ágiles con Scrum: sprints, dailies y entregas reales trabajando en equipo.',
                en: 'Three years at IES Santa Fe — Software Development degree. From UML diagrams and data modeling to agile methodologies with Scrum: sprints, dailies and real deliveries working as a team.',
              })}
            </p>
            <div style={{ marginTop: 22, fontWeight: 700, fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a8a8a' }}>
              IES Santa Fe — 2023 · 2025
            </div>
          </div>
        </div>
      </div>

      {/* ===== BLOCK 2: Streaming (foto derecha) ===== */}
      <div className="wh-block" style={{ position: 'relative', minHeight: '110vh' }}>
        <div
          data-img
          data-par="0.16"
          className="wh-photo"
          style={{ position: 'absolute', right: 0, top: 0, width: 'min(38vw, 620px)', aspectRatio: '16 / 10', overflow: 'hidden', willChange: 'transform' }}
        >
          <Photo src="/images/streaming.jpg" alt={t({ es: 'Plataforma de Streaming', en: 'Streaming Platform' })} style={{ height: '118%' }} />
        </div>

        <div className="wh-text" style={{ boxSizing: 'border-box', width: 'min(620px, 58vw)', padding: 'clamp(140px, 26vh, 300px) 24px 0 clamp(28px, 8vw, 140px)' }}>
          <div data-up style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#8a8a8a' }}>
            {t({ es: '( 01 ) — Práctica profesionalizante 1', en: '( 01 ) — Professional Internship 1' })}
          </div>
          <h3 data-up style={{ margin: '20px 0 0', fontWeight: 800, fontSize: 'clamp(38px, 4.4vw, 76px)', lineHeight: 0.98, letterSpacing: '-0.035em', textTransform: 'uppercase' }}>
            {t({ es: 'Plataforma de Streaming', en: 'Streaming Platform' })}
          </h3>
          <p data-up style={{ margin: '26px 0 0', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(20px, 1.9vw, 28px)', lineHeight: 1.4, color: '#1a1a1a' }}>
            {t({
              es: 'Un catálogo de películas construido full-stack con Symfony y PHP: subir, editar y borrar contenido, ranking de los más vistos y un panel de administración con control de usuarios y métricas de uso.',
              en: 'A movie catalog built full-stack with Symfony and PHP: upload, edit and delete content, a most-watched ranking, and an admin panel with user management and usage metrics.',
            })}
          </p>
          <div data-up style={{ marginTop: 26, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Symfony', 'PHP', 'MySQL', 'Twig'].map((tag) => (
              <span key={tag} style={tagStyle}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BLOCK 3: Náutica (foto izquierda) ===== */}
      <div className="wh-block" style={{ position: 'relative', minHeight: '110vh', marginTop: 'clamp(60px, 10vh, 120px)', paddingBottom: 'clamp(140px, 22vh, 260px)' }}>
        <div
          data-img
          data-par="0.16"
          className="wh-photo"
          style={{ position: 'absolute', left: 0, top: 'clamp(60px, 12vh, 160px)', width: 'min(38vw, 620px)', aspectRatio: '16 / 10', overflow: 'hidden', willChange: 'transform' }}
        >
          <Photo src="/images/nautica.webp" alt={t({ es: 'Guardería Náutica', en: 'Boat Storage Marina' })} style={{ height: '118%' }} />
        </div>

        <div className="wh-text" style={{ boxSizing: 'border-box', width: 'min(620px, 58vw)', marginLeft: 'auto', padding: 'clamp(140px, 26vh, 300px) clamp(28px, 8vw, 140px) 0 24px' }}>
          <div data-up style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#8a8a8a' }}>
            {t({ es: '( 02 ) — Práctica profesionalizante 2', en: '( 02 ) — Professional Internship 2' })}
          </div>
          <h3 data-up style={{ margin: '20px 0 0', fontWeight: 800, fontSize: 'clamp(38px, 4.4vw, 76px)', lineHeight: 0.98, letterSpacing: '-0.035em', textTransform: 'uppercase' }}>
            {t({ es: 'Guardería Náutica', en: 'Boat Storage Marina' })}
          </h3>
          <p data-up style={{ margin: '26px 0 0', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(20px, 1.9vw, 28px)', lineHeight: 1.4, color: '#1a1a1a' }}>
            {t({
              es: 'Sistema de gestión para una guardería de lanchas: inscripciones, horarios, usuarios y reportes operativos automatizados. Frontend en React, API en Java Spring Boot y PostgreSQL como base de datos.',
              en: 'Management system for a boat storage marina: bookings, schedules, users and automated operational reports. React frontend, Java Spring Boot API and PostgreSQL database.',
            })}
          </p>
          <div data-up style={{ marginTop: 26, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['React', 'Java Spring Boot', 'PostgreSQL', 'Scrum'].map((tag) => (
              <span key={tag} style={tagStyle}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
