'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage, type Localized } from '@/lib/language';

const NAV_ITEMS: { label: Localized; href: string }[] = [
  { label: { es: 'Acerca', en: 'About' }, href: '#about' },
  { label: { es: 'Trabajo', en: 'Work' }, href: '#work' },
  { label: { es: 'Proceso', en: 'Process' }, href: '#procesos' },
  { label: { es: 'Servicios', en: 'Services' }, href: '#servicios' },
  { label: { es: 'Contacto', en: 'Contact' }, href: '#contacto' },
];

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/latorresGH' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/laureano-torres-4872a7296/' },
  { label: 'Instagram', href: 'https://www.instagram.com/lauretrrs/' },
];

const EMAIL = 'laureano26112001@hotmail.com';

const navItemStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'clamp(10px, 1.6vh, 18px) 0',
  borderBottom: '1px solid #1e1e1c',
  fontWeight: 500,
  fontSize: 'clamp(30px, 4vw, 56px)',
  letterSpacing: '-0.03em',
  color: '#f4f3f1',
  overflow: 'hidden',
};

/**
 * footer — port fiel del HTML. Grid nav con hover (fondo scaleX + flecha),
 * detalles con email copiable, sociales, reloj de Santa Fe (GMT-3) y bottom bar.
 * (La grilla three.js del original estaba desactivada — fcHost = null.)
 */
export default function FooterSection() {
  const { t } = useLanguage();
  const clockRef = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const upd = () => {
      const time = new Date().toLocaleTimeString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      if (clockRef.current) clockRef.current.textContent = time;
    };
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, []);

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <footer style={{ position: 'relative', zIndex: 5, background: '#050505', color: '#f4f3f1', overflow: 'hidden', fontFamily: 'var(--font-main)' }}>
      <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(40px, 6vh, 72px) clamp(28px, 4vw, 72px) clamp(24px, 3vw, 36px)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 'clamp(32px, 5vw, 80px)', flex: 1 }}>
          {/* navegación */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700, marginBottom: 'clamp(20px, 3vh, 34px)' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#8a8a8a' }} />
              {t({ es: 'Navegación', en: 'Navigation' })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {NAV_ITEMS.map((item) => (
                <a key={item.label.en} className="foot-nav-item" href={item.href} style={navItemStyle}>
                  <span style={{ position: 'relative', zIndex: 2 }}>{t(item.label)}</span>
                  <span className="foot-nav-arrow" style={{ position: 'relative', zIndex: 2, opacity: 0, transform: 'translateX(-16px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
                    →
                  </span>
                  <span className="foot-nav-bg" style={{ position: 'absolute', inset: 0, background: '#d9d7d2', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)', zIndex: 1 }} />
                </a>
              ))}
            </div>
          </div>

          {/* detalles */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#6f6f6c' }}>
              {t({ es: '(DETALLES)', en: '(DETAILS)' })}
            </div>
            <button className="foot-link" onClick={copyEmail} style={{ display: 'inline-block', marginTop: 22, position: 'relative', fontWeight: 700, fontSize: 15, color: '#f4f3f1', cursor: 'none' }}>
              ↳ {copied ? t({ es: '¡Copiado!', en: 'Copied!' }) : EMAIL}
            </button>
            <div style={{ marginTop: 22, fontWeight: 500, fontSize: 14, lineHeight: 1.6, color: '#8a8a8a' }}>
              {t({ es: 'Basado en Santa Fe, Argentina.', en: 'Based in Santa Fe, Argentina.' })}
              <br />
              {t({ es: 'Trabajando en remoto para todo el mundo.', en: 'Working remotely for clients worldwide.' })}
            </div>
          </div>

          {/* sociales */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#6f6f6c' }}>
              {t({ es: '(SOCIALES)', en: '(SOCIALS)' })}
            </div>
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12, fontWeight: 700, fontSize: 17 }}>
              {SOCIALS.map((s) => (
                <a key={s.label} className="foot-link" href={s.href} style={{ position: 'relative', color: '#f4f3f1', width: 'fit-content' }}>
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 40px', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'clamp(40px, 6vh, 80px)' }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: '#8a8a8a' }}>
            Santa Fe, AR — <span ref={clockRef}>--:--:--</span>
          </div>
          <a className="foot-link" href="#top" style={{ position: 'relative', fontWeight: 700, fontSize: 14, color: '#f4f3f1' }}>
            {t({ es: 'Volver arriba', en: 'Back to top' })} ↑
          </a>
          <div style={{ fontWeight: 500, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6f6f6c' }}>©2026 Laureano</div>
        </div>
      </div>
    </footer>
  );
}
