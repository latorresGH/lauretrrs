'use client';

import { useLanguage } from '@/lib/language';
import Nav from '@/components/Nav';
import HeroSection from '@/components/HeroSection';
import FolioScene from '@/components/FolioScene';
import EducacionSection from '@/components/EducacionSection';
import StoriesSection from '@/components/StoriesSection';
import ProcesoServiciosSection from '@/components/ProcesoServiciosSection';
import FaqSection from '@/components/FaqSection';
import CtaBand from '@/components/CtaBand';
import FooterSection from '@/components/FooterSection';

/**
 * Orquesta las secciones en el orden del HTML original (portafolios.html).
 * HeroSection (v59) es sticky; el resto de las secciones lo cubren al scrollear.
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
      {/* El resto sube por encima del hero (sticky) y lo tapa; el Nav aparece acá. */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav />
        <FolioScene />
        <EducacionSection key={`edu-${lang}`} />
      <StoriesSection key={`stories-${lang}`} />
      <ProcesoServiciosSection key={`ps-${lang}`} />
      <FaqSection />
      <CtaBand />
      <FooterSection />
      </div>
    </>
  );
}
