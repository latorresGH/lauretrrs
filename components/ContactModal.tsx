'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useContactModal } from '@/lib/contact-modal';
import { useLanguage } from '@/lib/language';

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rate-limited';

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 0',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #d6d3cc',
  color: '#090906',
  fontSize: 16,
  fontFamily: 'var(--font-main)',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#6f6f6c',
  marginBottom: 8,
};

/**
 * Modal de contacto — abierto desde el CTA del Nav y del CtaBand vía
 * useContactModal(). Overlay siempre montado; GSAP anima entrada/salida
 * en base a isOpen. El envío pega a /api/contact (Resend + rate limit).
 */
export default function ContactModal() {
  const { isOpen, close } = useContactModal();
  const { t } = useLanguage();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const panel = panelRef.current;
      if (!overlay || !panel) return;

      if (isOpen) {
        gsap.set(overlay, { display: 'flex', pointerEvents: 'auto' });
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
        gsap.fromTo(
          panel,
          { opacity: 0, y: 40, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', delay: 0.05 },
        );
        firstFieldRef.current?.focus();
      } else {
        gsap.to(panel, { opacity: 0, y: 24, scale: 0.96, duration: 0.3, ease: 'power2.in' });
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => gsap.set(overlay, { display: 'none', pointerEvents: 'none' }),
        });
      }
    },
    { dependencies: [isOpen] },
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) return;
    const id = setTimeout(() => {
      setStatus('idle');
      setErrorMsg('');
    }, 400);
    return () => clearTimeout(id);
  }, [isOpen]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;

    const form = e.currentTarget;
    const data = new FormData(form);

    // honeypot: si un bot lo completó, fingimos éxito sin avisar nada
    if (String(data.get('company') ?? '').trim() !== '') {
      setStatus('success');
      return;
    }

    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    };

    if (payload.name.length < 2 || payload.message.length < 10 || !payload.email.includes('@')) {
      setStatus('error');
      setErrorMsg(t({ es: 'Revisá los campos antes de enviar.', en: 'Check the fields before sending.' }));
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        setStatus('rate-limited');
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErrorMsg(
          body?.error ?? t({ es: 'Algo salió mal. Probá de nuevo.', en: 'Something went wrong. Please try again.' }),
        );
        setStatus('error');
        return;
      }

      setStatus('success');
      form.reset();
    } catch {
      setErrorMsg(t({ es: 'No hay conexión. Probá de nuevo.', en: 'No connection. Please try again.' }));
      setStatus('error');
    }
  }

  return (
    <div
      ref={overlayRef}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) close();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 40px)',
        background: 'rgba(5, 5, 5, 0.72)',
        backdropFilter: 'blur(6px)',
        opacity: 0,
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 540,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#f4f3f1',
          color: '#090906',
          padding: 'clamp(28px, 4vw, 48px)',
          boxSizing: 'border-box',
          fontFamily: 'var(--font-main)',
        }}
      >
        <button
          type="button"
          onClick={close}
          aria-label={t({ es: 'Cerrar', en: 'Close' })}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: '#090906',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <div
          id="contact-modal-title"
          style={{
            fontSize: 'clamp(26px, 3.6vw, 38px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            paddingRight: 40,
          }}
        >
          {t({ es: 'Hablemos', en: "Let's talk" })}
        </div>
        <div style={{ marginTop: 10, fontSize: 15, color: '#6f6f6c', lineHeight: 1.5 }}>
          {t({
            es: 'Contame en qué estás pensando y te respondo a la brevedad.',
            en: "Tell me what you're thinking and I'll get back to you shortly.",
          })}
        </div>

        {status === 'success' ? (
          <div style={{ marginTop: 40, padding: '24px 0' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {t({ es: '¡Gracias! 🎉', en: 'Thank you! 🎉' })}
            </div>
            <div style={{ marginTop: 10, fontSize: 15, color: '#6f6f6c', lineHeight: 1.5 }}>
              {t({
                es: 'Recibí tu mensaje y te voy a contactar pronto.',
                en: "I've received your message and will reach out soon.",
              })}
            </div>
            <button
              type="button"
              onClick={close}
              style={{
                marginTop: 24,
                padding: '12px 20px',
                background: '#090906',
                color: '#f4f3f1',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {t({ es: 'Cerrar', en: 'Close' })}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
            {/* honeypot — invisible para personas, tentador para bots */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
            />

            <div>
              <label style={labelStyle} htmlFor="contact-name">
                {t({ es: 'Nombre', en: 'Name' })}
              </label>
              <input
                ref={firstFieldRef}
                id="contact-name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                style={fieldStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                style={fieldStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="contact-phone">
                {t({ es: 'Teléfono (opcional)', en: 'Phone (optional)' })}
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                maxLength={30}
                autoComplete="tel"
                style={fieldStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="contact-message">
                {t({ es: 'Contame tu proyecto', en: 'Tell me about your project' })}
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength={10}
                maxLength={3000}
                rows={4}
                style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'var(--font-main)' }}
              />
            </div>

            {status === 'error' && (
              <div role="alert" style={{ fontSize: 13, color: '#b3261e' }}>
                {errorMsg}
              </div>
            )}
            {status === 'rate-limited' && (
              <div role="alert" style={{ fontSize: 13, color: '#b3261e' }}>
                {t({
                  es: 'Enviaste varios mensajes seguidos. Esperá unos minutos y probá de nuevo.',
                  en: "You've sent several messages in a row. Wait a few minutes and try again.",
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                marginTop: 8,
                padding: '14px 24px',
                background: '#090906',
                color: '#f4f3f1',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '-0.01em',
                cursor: status === 'submitting' ? 'default' : 'pointer',
                opacity: status === 'submitting' ? 0.6 : 1,
              }}
            >
              {status === 'submitting'
                ? t({ es: 'Enviando…', en: 'Sending…' })
                : t({ es: 'Enviar mensaje', en: 'Send message' })}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
