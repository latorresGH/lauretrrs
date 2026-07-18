'use client';

/**
 * Registro central de plugins de GSAP.
 * Importar SOLO desde componentes cliente ('use client').
 * Se auto-registra al importarse; también exporta `registerGsap()` por si
 * hace falta forzarlo dentro de un useEffect.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

let registered = false;

export function registerGsap() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}

registerGsap();

export { gsap, ScrollTrigger, useGSAP };
