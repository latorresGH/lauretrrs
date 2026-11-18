import type { Metadata } from 'next';
import { Hanken_Grotesk, Fredoka, Instrument_Serif } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { LanguageProvider } from '@/lib/language';
import { LenisProvider } from '@/lib/lenis';
import { ContactModalProvider } from '@/lib/contact-modal';
import Cursor from '@/components/Cursor';
import ContactModal from '@/components/ContactModal';

const hanken = Hanken_Grotesk({
  variable: '--font-hanken',
  subsets: ['latin'],
  display: 'swap',
});

// Montserrat self-hosted (evita el fetch a Google Fonts en el build de Vercel).
const montserrat = localFont({
  variable: '--font-montserrat',
  display: 'swap',
  src: [
    { path: '../public/fonts/Montserrat/montserrat-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/Montserrat/montserrat-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/Montserrat/montserrat-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
});

const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
  display: 'swap',
});

const instrument = Instrument_Serif({
  variable: '--font-instrument',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

// Fuente variable HW Animo Trial (un solo woff2 cubre los pesos 250–990).
const animo = localFont({
  variable: '--font-animo',
  display: 'swap',
  src: '../public/fonts/HW Animo Trial/Variable/HWAnimoTRIALVF.woff2',
  weight: '250 990',
});

// Animo R600 estática — la usa el hero (v59).
const animo600 = localFont({
  variable: '--font-animo600',
  display: 'swap',
  src: '../public/fonts/HW Animo Trial/WEB/HWAnimoTRIAL-R600.woff2',
});

export const metadata: Metadata = {
  title: 'Laureano — Portfolio DSW',
  description:
    'Independent designer & developer crafting digital experiences where form meets motion.',
  icons: {
    icon: [
      { url: '/favicon-dark.svg', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-light.svg', media: '(prefers-color-scheme: light)' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${hanken.variable} ${fredoka.variable} ${instrument.variable} ${animo.variable} ${animo600.variable} ${montserrat.variable}`}
    >
      <body>
        <LanguageProvider>
          <LenisProvider>
            <ContactModalProvider>
              {children}
              <Cursor />
              <ContactModal />
            </ContactModalProvider>
          </LenisProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
