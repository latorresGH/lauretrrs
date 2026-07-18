import { Resend } from 'resend';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\-.\s]{6,30}$/;

function sanitizeLine(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return Response.json(
      { error: 'Demasiadas solicitudes. Probá de nuevo en unos minutos.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const { name, email, phone, message, company } = body as Record<string, unknown>;

  // Honeypot: si el bot completó este campo oculto, respondemos éxito sin enviar nada.
  if (typeof company === 'string' && company.trim() !== '') {
    return Response.json({ ok: true });
  }

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return Response.json({ error: 'Nombre inválido.' }, { status: 400 });
  }
  if (typeof email !== 'string' || email.trim().length > 254 || !EMAIL_RE.test(email.trim())) {
    return Response.json({ error: 'Email inválido.' }, { status: 400 });
  }
  if (
    phone !== undefined &&
    phone !== '' &&
    (typeof phone !== 'string' || !PHONE_RE.test(phone.trim()))
  ) {
    return Response.json({ error: 'Teléfono inválido.' }, { status: 400 });
  }
  if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 3000) {
    return Response.json({ error: 'Mensaje inválido.' }, { status: 400 });
  }

  const safeName = sanitizeLine(name);
  const safeEmail = sanitizeLine(email);
  const safePhone = phone ? sanitizeLine(String(phone)) : '—';
  const safeMessage = message.trim().slice(0, 3000);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? 'Portfolio <onboarding@resend.dev>';

  if (!apiKey || !to) {
    console.error('Faltan RESEND_API_KEY o CONTACT_TO_EMAIL en el entorno.');
    return Response.json(
      { error: 'El formulario no está configurado todavía.' },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: safeEmail,
      subject: `Nuevo contacto de ${safeName}`,
      text: `Nombre: ${safeName}\nEmail: ${safeEmail}\nTeléfono: ${safePhone}\n\n${safeMessage}`,
      html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#111">
        <p><strong>Nombre:</strong> ${escapeHtml(safeName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(safePhone)}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${escapeHtml(safeMessage).replace(/\n/g, '<br/>')}</p>
      </div>`,
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json({ error: 'No se pudo enviar el mensaje.' }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Error enviando email:', err);
    return Response.json({ error: 'No se pudo enviar el mensaje.' }, { status: 500 });
  }
}
