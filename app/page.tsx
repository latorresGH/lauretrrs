'use client';

import { useLanguage } from '@/lib/language';
import HeroSection from '@/components/HeroSection';
import WhiteSection from '@/components/WhiteSection';
import StoriesSection from '@/components/StoriesSection';
import ProcessSection from '@/components/ProcessSection';
import FaqSection from '@/components/FaqSection';
import CtaBand from '@/components/CtaBand';
import FooterSection from '@/components/FooterSection';

/**
 * Orquesta las secciones en el orden del HTML original (portafolios.html).
 * HeroSection contiene el #scroll-root con Nav (fijo) y FolioScene anidado.
 *
 * StoriesSection y ProcessSection manipulan el DOM de sus títulos de forma
 * imperativa (split de letras/caracteres para animar) por fuera de React, así
 * que un cambio de idioma no puede limitarse a re-renderizar su texto: se
 * fuerza un remount completo con `key={lang}` para que esos efectos se
 * vuelvan a inicializar limpios contra el texto nuevo.
 */
export default function Home() {
  const { lang } = useLanguage();

  return (
    <>
      <HeroSection />
      <WhiteSection />
      <StoriesSection key={`stories-${lang}`} />
      <ProcessSection key={`process-${lang}`} />
      <FaqSection />
      <CtaBand />
      <FooterSection />
    </>
  );
}
