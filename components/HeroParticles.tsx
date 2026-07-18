'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Partículas del Hero — port fiel del "Hero Editorial v3".
 *
 * SUPERNOVA: una esfera blanca y densa (planeta) rodeada de un anillo tipo
 * Júpiter. Al hacer scroll la cámara sale desde dentro del anillo (ACT 1),
 * el planeta detona y las partículas salen despedidas en trayectorias propias
 * (ACT 2) y finalmente el campo de escombros se recompone en la "L" del header.
 * Todo blanco, con un shader de glow gaussiano y twinkle por partícula.
 *
 * Repulsión de mouse en world-space vía raycaster. El progreso se mide sobre
 * ~200vh (scrollY / (innerHeight*2)).
 *
 * `onProgress` se llama cada frame con el smoothProgress (para el swap de
 * titulares ↔ descripción que maneja HeroSection).
 */

const N = 11000;
const NSPH = 8300; // partículas de la esfera; el resto forma el anillo
const R0 = 1.05; // radio de reposo de la esfera

export default function HeroParticles({
  onProgress,
  repelRadius = 0.55,
}: {
  onProgress?: (p: number) => void;
  repelRadius?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 0, 5.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const group = new THREE.Group();
    scene.add(group);

    // --- supernova: esfera densa + anillo tipo Júpiter ---
    const base = new Float32Array(N * 3); // dirección unitaria (esfera) / params del anillo
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const seeds = new Float32Array(N);
    const vel = new Float32Array(N); // multiplicador de velocidad de explosión
    const isRing = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      seeds[i] = Math.random();
      vel[i] = 0.6 + Math.pow(Math.random(), 2.5) * 3.2;
      if (i < NSPH) {
        // dirección uniforme sobre la esfera
        const u = Math.random() * Math.PI * 2;
        const cz = Math.random() * 2 - 1;
        const sz = Math.sqrt(1 - cz * cz);
        base[i * 3] = Math.cos(u) * sz;
        base[i * 3 + 1] = Math.sin(u) * sz;
        base[i * 3 + 2] = cz;
      } else {
        // anillo tipo Júpiter: banda anular plana, más densa hacia el borde interno
        isRing[i] = 1;
        const a = Math.random() * Math.PI * 2;
        const rr = 1.55 + Math.pow(Math.random(), 1.6) * 0.75;
        base[i * 3] = Math.cos(a) * rr;
        base[i * 3 + 1] = (Math.random() - 0.5) * 0.045; // muy fino
        base[i * 3 + 2] = Math.sin(a) * rr;
      }
      // puntos blancos y nítidos
      const t = 0.3 + 0.7 * Math.pow(Math.random(), 1.8);
      colors[i * 3] = 0.957 * t;
      colors[i * 3 + 1] = 0.953 * t;
      colors[i * 3 + 2] = 0.945 * t;
    }

    // --- forma objetivo: la "L" del header ---
    const targetL = new Float32Array(N * 3);
    {
      const H = 2.2; // altura total de la L
      const SW = 0.5; // grosor del trazo
      const FOOT = 1.5; // largo del pie
      const depth = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.16;
      const areaBar = SW * H;
      const areaFoot = (FOOT - SW) * SW;
      const pBar = areaBar / (areaBar + areaFoot);
      const cx = -(FOOT / 2 - SW / 2) * 0.5;
      for (let i = 0; i < N; i++) {
        let x: number, y: number;
        if (Math.random() < pBar) {
          x = -FOOT / 2 + Math.random() * SW;
          y = -H / 2 + Math.random() * H;
        } else {
          x = -FOOT / 2 + SW + Math.random() * (FOOT - SW);
          y = -H / 2 + Math.random() * SW;
        }
        targetL[i * 3] = x + cx;
        targetL[i * 3 + 1] = y;
        targetL[i * 3 + 2] = depth() * 0.6;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aCol', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    // shader: sprites con glow gaussiano suave y twinkle por partícula
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixel: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: [
        'attribute vec3 aCol;',
        'attribute float aSeed;',
        'uniform float uTime;',
        'uniform float uPixel;',
        'varying vec3 vCol;',
        'varying float vTw;',
        'void main() {',
        '  vCol = aCol;',
        '  vTw = 0.7 + 0.3 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 43.0);',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  float s = 0.5 + pow(aSeed, 3.0) * 0.9;',
        '  gl_PointSize = s * uPixel * (22.0 / -mv.z);',
        '  gl_Position = projectionMatrix * mv;',
        '}',
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vCol;',
        'varying float vTw;',
        'void main() {',
        '  vec2 p = gl_PointCoord - 0.5;',
        '  float d = length(p) * 2.0;',
        '  float a = smoothstep(1.0, 0.55, d);',
        '  gl_FragColor = vec4(vCol * vTw, a);',
        '}',
      ].join('\n'),
    });
    const points = new THREE.Points(geo, mat);
    group.add(points);
    group.rotation.z = 0.28;

    const offsets = new Float32Array(N * 3);
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2(10, 10);
    let mouseInFrame = false;

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // --- progreso de scroll sobre ~200vh ---
    let progress = 0;
    let smoothProgress = 0;
    const onScroll = () => {
      const max = window.innerHeight * 2;
      progress = Math.min(Math.max(window.scrollY / max, 0), 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // --- mouse ---
    const parallax = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      parallax.x = nx;
      parallax.y = ny;
      const rect = host.getBoundingClientRect();
      const inX = e.clientX >= rect.left && e.clientX <= rect.right;
      const inY = e.clientY >= rect.top && e.clientY <= rect.bottom;
      mouseInFrame = inX && inY;
      if (mouseInFrame) {
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // --- loop ---
    const rayOrigin = new THREE.Vector3();
    const rayDir = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    const worldPos = new THREE.Vector3();
    const t0 = performance.now();
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = (performance.now() - t0) / 1000;

      smoothProgress += (progress - smoothProgress) * 0.06;
      onProgressRef.current?.(smoothProgress);

      // morph escombros → L entre 67% y 97% del scroll (tramo largo = lento)
      let m = (smoothProgress - 0.67) / 0.3;
      m = Math.min(Math.max(m, 0), 1);
      m = m * m * (3 - 2 * m); // smoothstep

      const settle = 1 - m;
      mat.uniforms.uTime.value = t;

      // ACT 1 (0→35%): anillo en primer plano, la cámara retrocede
      let pull = smoothProgress / 0.35;
      pull = Math.min(Math.max(pull, 0), 1);
      pull = pull * pull * (3 - 2 * pull);
      // ACT 2 (38→68%): el planeta detona
      let ex = (smoothProgress - 0.38) / 0.3;
      ex = Math.min(Math.max(ex, 0), 1);
      ex = ex * ex * (3 - 2 * ex);

      // giro suave tipo vaivén (no acumula → al formar la L no "pega la vuelta"
      // ni se desenrolla): un poco de deriva por scroll + un sway sinusoidal,
      // todo apagándose con settle hacia la orientación final de la L.
      group.rotation.y =
        (smoothProgress * Math.PI * 0.2 + Math.sin(t * 0.14) * 0.12) * settle + Math.sin(t * 0.3) * 0.04 * m;
      group.rotation.x =
        (0.06 + pull * 0.1 + Math.sin(t * 0.09) * 0.02 * (1 - pull)) * settle;
      group.rotation.z = (0.02 + Math.sin(t * 0.11) * 0.02) * settle;
      group.position.y = (-0.06 + pull * 0.06) * settle;
      group.position.z = (-2.2 + pull * 2.2) * settle;
      // la cámara arranca dentro del anillo y sale al plano general
      camera.position.z = 1.7 + pull * 3.9 - m * 1.2;

      // parallax sutil (opuesto al mouse)
      group.position.x += (-parallax.x * 0.16 - group.position.x) * 0.04;
      group.position.y += (parallax.y * 0.12 - group.position.y) * 0.04;

      // repulsión de mouse en world-space (como la L)
      const strength = 0.5;
      if (mouseInFrame) {
        raycaster.setFromCamera(mouseNDC, camera);
        rayOrigin.copy(raycaster.ray.origin);
        rayDir.copy(raycaster.ray.direction);
      }
      group.updateMatrixWorld();
      const ringSpin = t * 0.12;
      for (let i = 0; i < N; i++) {
        const dx = base[i * 3];
        const dy = base[i * 3 + 1];
        const dz = base[i * 3 + 2];
        const sd = seeds[i];
        let sx: number, sy: number, sz2: number;
        if (isRing[i]) {
          // el anillo orbita despacio, inclinado; la explosión también lo dispersa
          const ca = Math.cos(ringSpin);
          const sa = Math.sin(ringSpin);
          const rx = dx * ca - dz * sa;
          const rz = dx * sa + dz * ca;
          const fling = 1 + ex * vel[i] * 1.8;
          sx = rx * fling;
          sy = (dy + rx * 0.16) * fling; // ligera inclinación
          sz2 = rz * fling;
        } else {
          // la esfera en reposo respira; la superficie titila
          const rest = R0 * (1 + Math.sin(t * 0.8 + sd * 20) * 0.03);
          const blast = ex * vel[i] * (2.6 + Math.sin(sd * 40) * 0.3);
          const rr = rest + blast;
          const wob = ex * 0.25 * Math.sin(t * (0.5 + sd) + sd * 30);
          sx = dx * rr + wob * dy;
          sy = dy * rr + wob * dz;
          sz2 = dz * rr + wob * dx;
        }
        const bx = sx + (targetL[i * 3] - sx) * m;
        const by = sy + (targetL[i * 3 + 1] - sy) * m;
        const bz = sz2 + (targetL[i * 3 + 2] - sz2) * m;
        let txo = 0;
        let tyo = 0;
        let tzo = 0;
        if (mouseInFrame) {
          worldPos.set(bx, by, bz).applyMatrix4(group.matrixWorld);
          tmp.copy(worldPos).sub(rayOrigin);
          const proj = tmp.dot(rayDir);
          tmp.copy(rayDir).multiplyScalar(proj).add(rayOrigin);
          const ox = worldPos.x - tmp.x;
          const oy = worldPos.y - tmp.y;
          const oz = worldPos.z - tmp.z;
          const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
          if (dist < repelRadius && dist > 0.0001) {
            const push = (1 - dist / repelRadius) * strength;
            txo = (ox / dist) * push;
            tyo = (oy / dist) * push;
            tzo = (oz / dist) * push;
          }
        }
        offsets[i * 3] += (txo - offsets[i * 3]) * 0.12;
        offsets[i * 3 + 1] += (tyo - offsets[i * 3 + 1]) * 0.12;
        offsets[i * 3 + 2] += (tzo - offsets[i * 3 + 2]) * 0.12;
        positions[i * 3] = bx + offsets[i * 3];
        positions[i * 3 + 1] = by + offsets[i * 3 + 1];
        positions[i * 3 + 2] = bz + offsets[i * 3 + 2];
      }
      geo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [repelRadius]);

  return <div id="canvas-host" ref={hostRef} style={{ position: 'absolute', inset: 0 }} />;
}
