# Prompt — Portfolio Next.js (Laureano)

## Contexto

Tenés un portfolio HTML hecho a mano que necesitás convertir en un proyecto Next.js 14+ con App Router, TypeScript, GSAP y Lenis. A continuación se describen con precisión todos los requisitos visuales, de estructura y de comportamiento. **No simplificues ningún efecto**; replicá todo con fidelidad.

---

## Stack obligatorio

- **Next.js 14+ con App Router** (`/app`)
- **TypeScript** (`.tsx` para componentes con JSX, `.ts` para lógica pura)
- **GSAP 3.12+** con `@gsap/react` (`useGSAP`) para todos los efectos
- **Lenis** para smooth scroll ralentizado (velocidad ≈ 0.7–0.8, easing `lenis/easing`)
- **Three.js** para la escena de partículas del hero y la grilla del footer
- **`next/image`** para todas las imágenes (nunca `<img>` nativo excepto dentro de canvas)
- **`next/font`** para las tipografías (Hanken Grotesk, Fredoka, Instrument Serif)
- Sin ningún framework CSS (no Tailwind, no CSS Modules obligatorios — podés usar CSS-in-JS inline o un archivo global)

---

## Estructura de archivos

```
/app
  layout.tsx          ← providers: Lenis, cursor global
  page.tsx            ← orquesta todas las secciones
/components
  Cursor.tsx
  Nav.tsx
  HeroSection.tsx     ← Three.js particles + scroll-driven reveal
  FolioScene.tsx      ← PORT / FOLIO convergence + foto rotante
  WorksSection.tsx    ← proyectos desde JSON
  ServicesSection.tsx ← servicios desde JSON
  ProcessSection.tsx  ← pasos pinned + Three.js grid
  FooterSection.tsx   ← marquee + nav items + CTA
/data
  projects.json       ← array de proyectos
  content.json        ← datos personales y textos (nombre, bio, ubicación, contacto, nav links, servicios, pasos de proceso, links de footer)
/lib
  lenis.tsx           ← provider de Lenis como context
  gsap.ts             ← registro de plugins GSAP
/public
  /images             ← fotos de perfil y proyectos
```

---

## Datos en JSON

### `/data/content.json`
```json
{
  "name": "Laureano",
  "title": "Form & Motion",
  "bio": "I'm Laureano — an independent designer & developer crafting digital experiences where form meets motion.",
  "location": "Buenos Aires, AR",
  "year": "©2026",
  "showreel": "Showreel 01",
  "contact": {
    "email": "tu@email.com",
    "phone": "+54 9 XXX XXX XXXX"
  },
  "nav": [
    { "label": { "es": "Inicio", "en": "Home" }, "href": "#me" },
    { "label": { "es": "Trabajos", "en": "Works" }, "href": "#procesos" },
    { "label": { "es": "Servicios", "en": "Services" }, "href": "#services" },
    { "label": { "es": "Proceso", "en": "Process" }, "href": "#process" }
  ],
  "ctaLabel": { "es": "Contactemos", "en": "Let's talk" },
  "services": [
    {
      "number": "01",
      "title": { "es": "Desarrollo Full Stack", "en": "Full Stack Development" },
      "description": { "es": "...", "en": "..." },
      "tags": ["NestJS", "Next.js", "PostgreSQL"]
    }
  ],
  "process": [
    {
      "title": { "es": "Descubrimiento", "en": "Discovery" },
      "detail": { "es": "...", "en": "..." }
    }
  ],
  "footer": {
    "tagline": { "es": "Construyamos algo increíble juntos.", "en": "Let's build something great together." },
    "links": [
      { "label": "GitHub", "href": "https://github.com/" },
      { "label": "LinkedIn", "href": "https://linkedin.com/in/" }
    ],
    "navItems": [
      { "label": { "es": "Inicio", "en": "Home" }, "href": "#me" }
    ]
  }
}
```

### `/data/projects.json`
```json
[
  {
    "id": "afterpanch",
    "title": "AfterPanch",
    "category": { "es": "App de pedidos", "en": "Ordering app" },
    "year": "2025",
    "tags": ["NestJS", "Next.js", "Prisma"],
    "image": "/images/afterpanch.jpg",
    "href": "#"
  }
]
```

---

## Idiomas (i18n sin librería externa)

- Implementá un `LanguageContext` sencillo con `useState('es' | 'en')` en el layout
- Un botón en la nav alterna entre ES / EN
- Todos los textos visibles vienen del JSON con clave `{ es: '...', en: '...' }`
- Usá un hook `useLang()` que devuelva `(key: { es: string; en: string }) => string`
- No uses `next-intl` ni `i18next` — solo context + JSON

---

## Lenis — smooth scroll

```ts
// /lib/lenis.tsx
'use client';
import Lenis from 'lenis';
import { useEffect, createContext, useContext, useRef } from 'react';
import gsap from 'gsap';

// Inicializá Lenis con:
const lenis = new Lenis({
  duration: 1.8,          // scroll más lento que el default
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
});

// Conectalo al ticker de GSAP (no usar requestAnimationFrame manual):
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

Exportá un `LenisProvider` que envuelva `{children}` y exponga `lenis` por context. En `layout.tsx` envolvé todo con `<LenisProvider>`.

---

## Cursor personalizado

- `Cursor.tsx`: `position: fixed`, `mix-blend-mode: difference`, dot blanco de 10px
- Seguí el mouse con GSAP `quickTo` (x e y separados, velocidad 0.6)
- Aparece al entrar al viewport (opacity 0 → 1)
- En `layout.tsx`: `body { cursor: none }`

---

## HeroSection — efectos requeridos

### Three.js particles
- Escena full-bleed detrás del texto (`position: absolute; inset: 0`)
- ~2500 partículas en formación esférica
- Rotación suave + efecto de "respiración" (morphing hacia otra forma con `sin(time)`)
- El mouse influye en la formación: las partículas cercanas al cursor se separan
- Color: `#9a9a9a` con variación sutil de opacidad
- `renderer.setClearColor(0x101010)` — fondo oscuro

### Reveal de textos al cargar
Usá `useGSAP` con `gsap.from` en un timeline encadenado:
1. Nav: `opacity 0, y -30` → `opacity 1, y 0`, ease `power3.out`, delay 0.3s
2. `"Form &"`: `opacity 0, y 60` → `opacity 1, y 0`
3. `"Motion"`: mismo, stagger 0.15s
4. Meta bar (©2026 / Buenos Aires / Showreel): `opacity 0, y 30` → `opacity 1, y 0`

### Scroll-driven (sin ScrollTrigger — usar scroll listener manual como el original)
- Wrapper `#scroll-root` tiene `height: 500vh`; `#hero-root` es `position: sticky; top: 0; height: 100vh`
- Al hacer scroll dentro de esos 500vh:
  - El hero-root hace `translateY(-sfp * 22vh)` con lerp 0.08
  - El brillo del contenido baja con `filter: brightness(1 - sfp * 0.85)`
  - El bloque `#about-block` (nombre, bio, ubicación) hace reveal con `opacity 0, y 40` → `1, 0` cuando sfp > 0.6

---

## FolioScene — "PORT / FOLIO"

- Sección de `height: 200vh` con un `sticky` inner de 100vh
- Dos textos gigantes (`clamp(70px, 11vw, 190px)`, Trebuchet MS bold):
  - `"PORT"` alineado a la izquierda
  - `"FOLIO"` alineado a la derecha
- Scroll-driven convergence: empiezan separados 42vw y convergen al centro con smoothstep
- En el centro: imagen vertical (3:4) que escala de 0 a 1 con el mismo progreso
- La imagen rota entre 3 fotos de perfil cada 1.5 segundos (crossfade opacity lerp 0.12)
- Texto `"MY "` aparece antes de `"PORT"` con `max-width 0 → 1.6em` cuando progress > 0.72
- Wobble sinusoidal: `translateY(sin(t/900) * 1.2px)` opuesto en PORT y FOLIO
- Al completarse la convergencia: fade in de título `"My Portfolio"` abajo

---

## WorksSection — proyectos

- Fuente de datos: `projects.json`
- Layout: lista vertical, cada item ocupa ancho completo
- Cada proyecto: número (01, 02...), título grande, categoría, year, tags, imagen hover
- Al hacer hover sobre el item → la imagen del proyecto aparece flotante siguiendo el cursor (efecto "image trail on hover")
- Animación de entrada: cada item hace `translateY(40px) → 0` con ScrollTrigger stagger

---

## ServicesSection

- Datos desde `content.json → services`
- Cada servicio: número, título, descripción colapsable, tags
- Layout: dos columnas en desktop, una en mobile
- Entrada con ScrollTrigger stagger

---

## ProcessSection — pinned

- `height: 400vh` con inner `sticky`
- Escena Three.js: grilla de puntos (20x20) con efecto de onda sinusoidal que reacciona al mouse
  - Color `#2a2a2a`, puntos `PointsMaterial` size 2
  - La grilla rota levemente con `sin(time * 0.1) * 0.12`
- A la izquierda: número grande (`proc-bignum`) que transiciona con GSAP cuando cambia el paso
- A la derecha: lista de pasos; el activo se expande (`height: scrollHeight`) y el título se ilumina
- El paso activo se calcula por progreso de scroll dentro del pin

---

## FooterSection

- Fondo `#101010`, texto `#f4f3f1`
- Marquee horizontal infinito: `"Available for new projects — "` repetido, `animation: marqueeMove` (translateX 0 → -50%), velocidad 28s lineal infinito
- Tagline grande (`clamp(32px, 5vw, 72px)`) desde `content.json`
- Links sociales (GitHub, LinkedIn, etc.) con efecto underline animado (scaleX derecha→izquierda en hover)
- Nav items del footer: fondo `#f4f3f1` que hace `scaleX 0 → 1` en hover (transform-origin left), texto cambia a `#101010`, flecha aparece desde la izquierda
- CTA button: fondo `#f4f3f1`, al hover la flecha diagonal se mueve `translate(6px, -6px)`
- Email copiable al click con feedback visual

---

## Grain layer

- En el layout global: `div` con `position: fixed; inset: -10%; z-index: 9999; pointer-events: none`
- SVG inline de `feTurbulence` como `background-image`
- `opacity: 0.055`
- `animation: grainShift 1.2s steps(6) infinite`

---

## Optimizaciones requeridas

1. **Componentes Three.js** → `dynamic(() => import(...), { ssr: false })` (nunca en SSR)
2. **GSAP plugins** → registrar en un `useEffect` o en `/lib/gsap.ts` importado solo en client
3. **`next/image`** con `priority` para las 3 fotos del FolioScene, lazy para proyectos
4. **`next/font`** para Hanken Grotesk, Fredoka, Instrument Serif — sin CDN de Google
5. **Scroll listeners** con `{ passive: true }` siempre
6. **Cleanup** de todos los `gsap.ticker.add()` y event listeners en el return de `useEffect` o en `useGSAP`'s cleanup
7. **`will-change: transform`** solo en elementos que realmente se animan (cursor, PORT/FOLIO texts, imagen central)
8. **Fonts subsetting** con `display: 'swap'` en `next/font`

---

## Paleta y tipografía

```css
--bg: #101010;
--surface: #f4f3f1;
--muted: #9a9a9a;
--accent: #4a4a4a;
--text: #f4f3f1;

/* Tipografías */
--font-main: 'Hanken Grotesk'; /* UI, cuerpo, nav */
--font-display: 'Trebuchet MS'; /* PORT / FOLIO */
--font-serif: 'Instrument Serif'; /* acentos itálicos */
--font-fun: 'Fredoka'; /* tags, detalles */
```

---

## Notas finales

- Todo componente que use hooks de browser (`window`, `document`, `performance`) debe ser `'use client'`
- Los Server Components solo manejan estructura estática (layouts, importación de JSON)
- El JSON se importa directamente con `import data from '@/data/projects.json'` (Next.js lo soporta nativamente con `resolveJsonModule`)
- Si usás `useGSAP`, el scope siempre es el ref del contenedor del componente
- Lenis y el cursor son los únicos singletons globales — instancialos una sola vez en el layout
