// ui-69 — AuroraBackground
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

// Load Three.js once from CDN and share the promise across every mount, so the
// library keeps a zero bundled-3D footprint.
let threePromise: Promise<unknown> | null = null;
function loadThree(): Promise<unknown> {
  const w = window as unknown as { THREE?: unknown };
  if (w.THREE) return Promise.resolve(w.THREE);
  if (threePromise) return threePromise;
  threePromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = THREE_SRC;
    s.async = true;
    s.onload = () => resolve(w.THREE);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return threePromise;
}

const VERT = `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 uBg, uPlum, uVerm, uBone;

  float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
  }
  float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5;} return v; }

  void main(){
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = uv - 0.5; p.x *= aspect;
    float t = uTime * 0.06;
    vec2 q = vec2(fbm(p*2.0 + t), fbm(p*2.0 - t + 5.2));
    vec2 r = vec2(fbm(p*2.0 + q*1.5 + t*1.3), fbm(p*2.0 + q*1.5 - t));
    float f = fbm(p*2.5 + r*1.8);
    float band = smoothstep(0.2, 0.9, f + 0.25*sin(p.y*3.0 + t*2.0 + r.x*3.0));
    float core = exp(-3.5*dot(p,p)) * (0.6 + 0.4*sin(uTime*0.8));
    vec3 col = uBg;
    col = mix(col, uPlum, band*0.9);
    col += uVerm * pow(band, 1.6) * 0.8;
    col += uVerm * core * 0.5;
    col += uBone * core * 0.15;
    col *= smoothstep(1.2, 0.2, length(p));
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface AuroraBackgroundProps {
  className?: string;
  /** Fires once the live WebGL canvas is running (not on the static fallback). */
  onReady?: () => void;
}

/**
 * Self-running WebGL aurora backdrop: domain-warped fbm light with a breathing
 * core, additive vermilion ribbons over an ink base. Three.js r128 is fetched
 * from a CDN on demand. Fills its positioned parent — drop it behind content.
 *
 * Reduced motion / no WebGL: a static CSS radial-gradient "disc" stands in.
 */
export function AuroraBackground({ className = '', onReady }: AuroraBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    if (!host) return;

    let raf = 0;
    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderer: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ro: ResizeObserver | undefined;

    loadThree()
      .then((mod) => {
        if (disposed) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const THREE: any = mod;
        const rgb = (hex: string) => {
          const m = hex.replace('#', '');
          return [parseInt(m.slice(0, 2), 16) / 255, parseInt(m.slice(2, 4), 16) / 255, parseInt(m.slice(4, 6), 16) / 255];
        };
        try {
          renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        } catch {
          setFailed(true);
          return;
        }
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        host.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';

        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
        const uniforms = {
          uTime: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uBg: { value: new THREE.Vector3(...rgb('#0b0a0d')) },
          uPlum: { value: new THREE.Vector3(...rgb('#241a33')) },
          uVerm: { value: new THREE.Vector3(...rgb('#ff4d23')) },
          uBone: { value: new THREE.Vector3(...rgb('#ece6d8')) },
        };
        const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

        const resize = () => {
          const w = host.clientWidth || 1;
          const h = host.clientHeight || 1;
          renderer.setSize(w, h, false);
          uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
        };
        ro = new ResizeObserver(resize);
        ro.observe(host);
        resize();

        const start = performance.now();
        const loop = () => {
          uniforms.uTime.value = (performance.now() - start) / 1000;
          renderer.render(scene, camera);
          raf = requestAnimationFrame(loop);
        };
        loop();
        onReady?.();
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      if (renderer) {
        renderer.dispose?.();
        renderer.domElement?.remove();
      }
    };
  }, [reduced, onReady]);

  const staticBg =
    'radial-gradient(58% 58% at 50% 42%, rgba(255,77,35,.18), rgba(36,26,51,.34) 42%, #0b0a0d 72%)';

  return (
    <div
      ref={hostRef}
      className={`absolute inset-0 h-full w-full overflow-hidden ${className}`}
      style={reduced || failed ? { background: staticBg } : { background: '#0b0a0d' }}
    />
  );
}
